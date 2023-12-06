import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { sendToPipeline } from "@/app/lib/pipelines";
import { getPerson } from "@fastform/lib/person/service";
import { capturePosthogEvent } from "@fastform/lib/posthogServer";
import { createResponse } from "@fastform/lib/response/service";
import { getSurvey } from "@fastform/lib/form/service";
import { getTeamDetails } from "@fastform/lib/teamDetail/service";
import { ZId } from "@fastform/types/environment";
import { InvalidInputError } from "@fastform/types/errors";
import { TResponse, ZResponseInput } from "@fastform/types/responses";
import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

interface Context {
  params: {
    environmentId: string;
  };
}

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

export async function POST(request: Request, context: Context): Promise<NextResponse> {
  const { environmentId } = context.params;
  const environmentIdValidation = ZId.safeParse(environmentId);

  if (!environmentIdValidation.success) {
    return responses.badRequestResponse(
      "Fields are missing or incorrectly formatted",
      transformErrorToDetails(environmentIdValidation.error),
      true
    );
  }

  const responseInput = await request.json();

  // legacy workaround for fastform-js 1.2.0 & 1.2.1
  if (responseInput.personId && typeof responseInput.personId === "string") {
    const person = await getPerson(responseInput.personId);
    responseInput.userId = person?.userId;
    delete responseInput.personId;
  }

  const agent = UAParser(request.headers.get("user-agent"));
  const inputValidation = ZResponseInput.safeParse({ ...responseInput, environmentId });

  if (!inputValidation.success) {
    return responses.badRequestResponse(
      "Fields are missing or incorrectly formatted",
      transformErrorToDetails(inputValidation.error),
      true
    );
  }

  // get and check form
  const form = await getSurvey(responseInput.surveyId);
  if (!form) {
    return responses.notFoundResponse("Form", responseInput.surveyId, true);
  }
  if (form.environmentId !== environmentId) {
    return responses.badRequestResponse(
      "Form is part of another environment",
      {
        "form.environmentId": form.environmentId,
        environmentId,
      },
      true
    );
  }

  const teamDetails = await getTeamDetails(form.environmentId);

  let response: TResponse;
  try {
    const meta = {
      source: responseInput?.meta?.source,
      url: responseInput?.meta?.url,
      userAgent: {
        browser: agent?.browser.name,
        device: agent?.device.type,
        os: agent?.os.name,
      },
    };

    response = await createResponse({
      ...inputValidation.data,
      meta,
    });
  } catch (error) {
    if (error instanceof InvalidInputError) {
      return responses.badRequestResponse(error.message);
    } else {
      console.error(error);
      return responses.internalServerErrorResponse(error.message);
    }
  }

  sendToPipeline({
    event: "responseCreated",
    environmentId: form.environmentId,
    surveyId: response.surveyId,
    response: response,
  });

  if (responseInput.finished) {
    sendToPipeline({
      event: "responseFinished",
      environmentId: form.environmentId,
      surveyId: response.surveyId,
      response: response,
    });
  }

  if (teamDetails?.teamOwnerId) {
    await capturePosthogEvent(teamDetails.teamOwnerId, "response created", teamDetails.teamId, {
      surveyId: response.surveyId,
      surveyType: form.type,
    });
  } else {
    console.warn("Posthog capture not possible. No team owner found");
  }

  return responses.successResponse({ id: response.id }, true);
}
