import { responses } from "@/app/lib/api/response";
import { NextResponse } from "next/server";
import { getSurvey, updateSurvey, deleteSurvey } from "@fastform/lib/form/service";
import { TSurvey, ZSurvey } from "@fastform/types/surveys";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { authenticateRequest } from "@/app/api/v1/auth";
import { handleErrorResponse } from "@/app/api/v1/auth";

async function fetchAndAuthorizeSurvey(authentication: any, surveyId: string): Promise<TSurvey | null> {
  const form = await getSurvey(surveyId);
  if (!form) {
    return null;
  }
  if (form.environmentId !== authentication.environmentId) {
    throw new Error("Unauthorized");
  }
  return form;
}

export async function GET(
  request: Request,
  { params }: { params: { surveyId: string } }
): Promise<NextResponse> {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const form = await fetchAndAuthorizeSurvey(authentication, params.surveyId);
    if (form) {
      return responses.successResponse(form);
    }
    return responses.notFoundResponse("Form", params.surveyId);
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { surveyId: string } }
): Promise<NextResponse> {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const form = await fetchAndAuthorizeSurvey(authentication, params.surveyId);
    if (!form) {
      return responses.notFoundResponse("Form", params.surveyId);
    }
    const deletedSurvey = await deleteSurvey(params.surveyId);
    return responses.successResponse(deletedSurvey);
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { surveyId: string } }
): Promise<NextResponse> {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const form = await fetchAndAuthorizeSurvey(authentication, params.surveyId);
    if (!form) {
      return responses.notFoundResponse("Form", params.surveyId);
    }
    const surveyUpdate = await request.json();
    const inputValidation = ZSurvey.safeParse({
      ...form,
      ...surveyUpdate,
    });
    if (!inputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(inputValidation.error)
      );
    }
    return responses.successResponse(await updateSurvey(inputValidation.data));
  } catch (error) {
    return handleErrorResponse(error);
  }
}
