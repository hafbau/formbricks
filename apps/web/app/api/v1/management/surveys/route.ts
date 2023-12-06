import { responses } from "@/app/lib/api/response";
import { authenticateRequest } from "@/app/api/v1/auth";
import { NextResponse } from "next/server";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { createSurvey, getSurveys } from "@fastform/lib/form/service";
import { ZSurveyInput } from "@fastform/types/surveys";
import { DatabaseError } from "@fastform/types/errors";

export async function GET(request: Request) {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const surveys = await getSurveys(authentication.environmentId!);
    return responses.successResponse(surveys);
  } catch (error) {
    if (error instanceof DatabaseError) {
      return responses.badRequestResponse(error.message);
    }
    throw error;
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const surveyInput = await request.json();
    const inputValidation = ZSurveyInput.safeParse(surveyInput);

    if (!inputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(inputValidation.error),
        true
      );
    }

    const environmentId = authentication.environmentId;
    const surveyData = { ...inputValidation.data, environmentId: undefined };

    const form = await createSurvey(environmentId, surveyData);
    return responses.successResponse(form);
  } catch (error) {
    if (error instanceof DatabaseError) {
      return responses.badRequestResponse(error.message);
    }
    throw error;
  }
}
