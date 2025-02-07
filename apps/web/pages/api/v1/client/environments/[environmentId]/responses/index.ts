import { sendToPipeline } from "@/app/lib/pipelines";
import { prisma } from "@fastform/database";
import { transformPrismaPerson } from "@fastform/lib/person/service";
import { capturePosthogEvent } from "@fastform/lib/posthogServer";
import { captureTelemetry } from "@fastform/lib/telemetry";
import { TResponse } from "@fastform/types/responses";
import { TTag } from "@fastform/types/tags";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const environmentId = req.query.environmentId?.toString();

  if (!environmentId) {
    return res.status(400).json({ message: "Missing environmentId" });
  }

  // CORS
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // POST
  else if (req.method === "POST") {
    const { formId, personId, response } = req.body;

    if (!formId) {
      return res.status(400).json({ message: "Missing formId" });
    }
    if (!response) {
      return res.status(400).json({ message: "Missing data" });
    }
    // personId can be null, e.g. for link forms

    // check if form exists
    const form = await prisma.form.findUnique({
      where: {
        id: formId,
      },
      select: {
        id: true,
        type: true,
      },
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // get teamId from environment
    const environment = await prisma.environment.findUnique({
      where: {
        id: environmentId,
      },
      select: {
        product: {
          select: {
            team: {
              select: {
                id: true,
                memberships: {
                  select: {
                    userId: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!environment) {
      return res.status(404).json({ message: "Environment not found" });
    }

    const teamId = environment.product.team.id;
    // find team owner
    const teamOwnerId = environment.product.team.memberships.find((m) => m.role === "owner")?.userId;

    const responseInput = {
      form: {
        connect: {
          id: formId,
        },
      },
      ...response,
    };

    if (personId) {
      responseInput.data.person = {
        connect: {
          id: personId,
        },
      };
    }

    // create new response
    const responsePrisma = await prisma.response.create({
      data: {
        ...responseInput,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        formId: true,
        finished: true,
        data: true,
        ttc: true,
        meta: true,
        personAttributes: true,
        singleUseId: true,
        person: {
          select: {
            id: true,
            userId: true,
            environmentId: true,
            createdAt: true,
            updatedAt: true,
            attributes: {
              select: {
                value: true,
                attributeClass: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        notes: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            text: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
            isResolved: true,
            isEdited: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                name: true,
                environmentId: true,
              },
            },
          },
        },
      },
    });

    const responseData: TResponse = {
      ...responsePrisma,
      person: responsePrisma.person ? transformPrismaPerson(responsePrisma.person) : null,
      tags: responsePrisma.tags.map((tagPrisma: { tag: TTag }) => tagPrisma.tag),
    };

    // send response to pipeline
    // don't await to not block the response
    sendToPipeline({
      environmentId,
      formId,
      event: "responseCreated",
      response: responseData,
    });

    if (response.finished) {
      // send response to pipeline
      // don't await to not block the response
      sendToPipeline({
        environmentId,
        formId,
        event: "responseFinished",
        response: responseData,
      });
    }

    captureTelemetry("response created");
    if (teamOwnerId) {
      await capturePosthogEvent(teamOwnerId, "response created", teamId, {
        formId,
        formType: form.type,
      });
    } else {
      console.warn("Posthog capture not possible. No team owner found");
    }

    return res.json({ id: responseData.id });
  }

  // Unknown HTTP Method
  else {
    throw new Error(`The HTTP ${req.method} method is not supported by this route.`);
  }
}
