import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { createDisplay } from "@fastform/lib/display/service";
import { capturePosthogEvent } from "@fastform/lib/posthogServer";
import { getTeamDetails } from "@fastform/lib/teamDetail/service";
import { ZDisplayCreateInput } from "@fastform/types/displays";
import { InvalidInputError } from "@fastform/types/errors";
import { NextResponse } from "next/server";

interface Context {
  params: {
    environmentId: string;
  };
}

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

export async function POST(request: Request, context: Context): Promise<NextResponse> {
  const jsonInput = await request.json();
  const inputValidation = ZDisplayCreateInput.safeParse({
    ...jsonInput,
    environmentId: context.params.environmentId,
  });

  if (!inputValidation.success) {
    return responses.badRequestResponse(
      "Fields are missing or incorrectly formatted",
      transformErrorToDetails(inputValidation.error),
      true
    );
  }

  // find teamId & teamOwnerId from environmentId
  const teamDetails = await getTeamDetails(inputValidation.data.environmentId);
  let response = {};

  // create display
  try {
    const { id } = await createDisplay(inputValidation.data);
    response = { id };
  } catch (error) {
    if (error instanceof InvalidInputError) {
      return responses.badRequestResponse(error.message);
    } else {
      console.error(error);
      return responses.internalServerErrorResponse(error.message);
    }
  }

  if (teamDetails?.teamOwnerId) {
    await capturePosthogEvent(teamDetails.teamOwnerId, "display created", teamDetails.teamId);
  } else {
    console.warn("Posthog capture not possible. No team owner found");
  }

  return responses.successResponse(response, true);
}
