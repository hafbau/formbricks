import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { sendToPipeline } from "@/app/lib/pipelines";
import { capturePosthogEvent } from "@fastform/lib/posthogServer";
import { createResponseLegacy } from "@fastform/lib/response/service";
import { getform } from "@fastform/lib/form/service";
import { getTeamDetails } from "@fastform/lib/teamDetail/service";
import { InvalidInputError } from "@fastform/types/errors";
import { TResponse, ZResponseLegacyInput } from "@fastform/types/responses";
import { TForm } from "@fastform/types/forms";
import { NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

export async function POST(request: Request): Promise<NextResponse> {
  const responseInput = await request.json();
  if (responseInput.personId === "legacy") {
    responseInput.personId = null;
  }
  const agent = UAParser(request.headers.get("user-agent"));
  const inputValidation = ZResponseLegacyInput.safeParse(responseInput);

  if (!inputValidation.success) {
    return responses.badRequestResponse(
      "Fields are missing or incorrectly formatted",
      transformErrorToDetails(inputValidation.error),
      true
    );
  }

  let form: TForm | null;

  try {
    form = await getform(responseInput.formId);
    if (!form) {
      return responses.notFoundResponse("Form", responseInput.formId);
    }
  } catch (error) {
    if (error instanceof InvalidInputError) {
      return responses.badRequestResponse(error.message);
    } else {
      console.error(error);
      return responses.internalServerErrorResponse(error.message);
    }
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

    // check if personId is anonymous
    if (responseInput.personId === "anonymous") {
      // remove this from the request
      responseInput.personId = null;
    }

    response = await createResponseLegacy({
      ...responseInput,
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
    formId: response.formId,
    response: response,
  });

  if (responseInput.finished) {
    sendToPipeline({
      event: "responseFinished",
      environmentId: form.environmentId,
      formId: response.formId,
      response: response,
    });
  }

  if (teamDetails?.teamOwnerId) {
    await capturePosthogEvent(teamDetails.teamOwnerId, "response created", teamDetails.teamId, {
      formId: response.formId,
      formType: form.type,
    });
  } else {
    console.warn("Posthog capture not possible. No team owner found");
  }

  return responses.successResponse({ id: response.id }, true);
}
