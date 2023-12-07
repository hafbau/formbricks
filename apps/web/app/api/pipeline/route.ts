import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { sendResponseFinishedEmail } from "@/app/lib/email";
import { prisma } from "@fastform/database";
import { INTERNAL_SECRET } from "@fastform/lib/constants";
import { convertDatesInObject } from "@fastform/lib/time";
import { TformQuestion } from "@fastform/types/forms";
import { TUserNotificationSettings } from "@fastform/types/users";
import { ZPipelineInput } from "@fastform/types/pipelines";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { handleIntegrations } from "./lib/handleIntegrations";

export async function POST(request: Request) {
  // check authentication with x-api-key header and CRON_SECRET env variable
  if (headers().get("x-api-key") !== INTERNAL_SECRET) {
    return responses.notAuthenticatedResponse();
  }
  const jsonInput = await request.json();

  convertDatesInObject(jsonInput);

  const inputValidation = ZPipelineInput.safeParse(jsonInput);

  if (!inputValidation.success) {
    console.error(inputValidation.error);
    return responses.badRequestResponse(
      "Fields are missing or incorrectly formatted",
      transformErrorToDetails(inputValidation.error),
      true
    );
  }

  const { environmentId, formId, event, response } = inputValidation.data;

  // get all webhooks of this environment where event in triggers
  const webhooks = await prisma.webhook.findMany({
    where: {
      environmentId,
      triggers: {
        has: event,
      },
      OR: [
        {
          formIds: {
            has: formId,
          },
        },
        {
          formIds: {
            isEmpty: true,
          },
        },
      ],
    },
  });

  // send request to all webhooks
  await Promise.all(
    webhooks.map(async (webhook) => {
      await fetch(webhook.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          webhookId: webhook.id,
          event,
          data: response,
        }),
      });
    })
  );

  if (event === "responseFinished") {
    // check for email notifications
    // get all users that have a membership of this environment's team
    const users = await prisma.user.findMany({
      where: {
        memberships: {
          some: {
            team: {
              products: {
                some: {
                  environments: {
                    some: {
                      id: environmentId,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const integrations = await prisma.integration.findMany({
      where: {
        environmentId,
      },
    });
    if (integrations.length > 0) {
      handleIntegrations(integrations, inputValidation.data);
    }
    // filter all users that have email notifications enabled for this form
    const usersWithNotifications = users.filter((user) => {
      const notificationSettings: TUserNotificationSettings | null = user.notificationSettings;
      if (notificationSettings?.alert && notificationSettings.alert[formId]) {
        return true;
      }
      return false;
    });

    if (usersWithNotifications.length > 0) {
      // get form
      const formData = await prisma.form.findUnique({
        where: {
          id: formId,
        },
        select: {
          id: true,
          name: true,
          questions: true,
        },
      });
      if (!formData) {
        console.error(`Pipeline: Form with id ${formId} not found`);
        return new Response("Form not found", {
          status: 404,
        });
      }
      // create form object
      const form = {
        id: formData.id,
        name: formData.name,
        questions: JSON.parse(JSON.stringify(formData.questions)) as TformQuestion[],
      };
      // send email to all users
      await Promise.all(
        usersWithNotifications.map(async (user) => {
          await sendResponseFinishedEmail(user.email, environmentId, form, response);
        })
      );
    }

    const updateformStatus = async (formId: string) => {
      // Get the form instance by formId
      const form = await prisma.form.findUnique({
        where: {
          id: formId,
        },
        select: {
          autoComplete: true,
        },
      });

      if (form?.autoComplete) {
        // Get the number of responses to a form
        const responseCount = await prisma.response.count({
          where: {
            formId: formId,
          },
        });
        if (responseCount === form.autoComplete) {
          await prisma.form.update({
            where: {
              id: formId,
            },
            data: {
              status: "completed",
            },
          });
        }
      }
    };
    await updateformStatus(formId);
  }

  return NextResponse.json({ data: {} });
}
