import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { createDisplayLegacy } from "@fastform/lib/display/service";
import { capturePosthogEvent } from "@fastform/lib/posthogServer";
import { getform } from "@fastform/lib/form/service";
import { getTeamDetails } from "@fastform/lib/teamDetail/service";
import { TDisplay, ZDisplayLegacyCreateInput } from "@fastform/types/displays";
import { InvalidInputError } from "@fastform/types/errors";
import { NextResponse } from "next/server";

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

export async function POST(request: Request): Promise<NextResponse> {
  const jsonInput = await request.json();
  if (jsonInput.personId === "legacy") {
    delete jsonInput.personId;
  }
  const inputValidation = ZDisplayLegacyCreateInput.safeParse(jsonInput);

  if (!inputValidation.success) {
    return responses.badRequestResponse(
      "Fields are missing or incorrectly formatted",
      transformErrorToDetails(inputValidation.error),
      true
    );
  }

  const { formId, responseId } = inputValidation.data;
  let { personId } = inputValidation.data;

  // find environmentId from formId
  let form;

  try {
    form = await getform(formId);
  } catch (error) {
    if (error instanceof InvalidInputError) {
      return responses.badRequestResponse(error.message);
    } else {
      console.error(error);
      return responses.internalServerErrorResponse(error.message);
    }
  }

  // find teamId & teamOwnerId from environmentId
  const teamDetails = await getTeamDetails(form.environmentId);

  // create display
  let display: TDisplay;
  try {
    display = await createDisplayLegacy({
      formId,
      personId,
      responseId,
    });
  } catch (error) {
    if (error instanceof InvalidInputError) {
      return responses.badRequestResponse(error.message);
    } else {
      console.error(error);
      return responses.internalServerErrorResponse(error.message);
    }
  }

  if (teamDetails?.teamOwnerId) {
    await capturePosthogEvent(teamDetails.teamOwnerId, "display created", teamDetails.teamId, {
      formId,
    });
  } else {
    console.warn("Posthog capture not possible. No team owner found");
  }

  return responses.successResponse({ id: display.id }, true);
}
