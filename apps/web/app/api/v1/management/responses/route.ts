import { authenticateRequest } from "@/app/api/v1/auth";
import { responses } from "@/app/lib/api/response";
import { getResponsesByEnvironmentId } from "@fastform/lib/response/service";
import { DatabaseError } from "@fastform/types/errors";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const surveyId = request.nextUrl.searchParams.get("surveyId");
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    let environmentResponses = await getResponsesByEnvironmentId(authentication.environmentId!);
    if (surveyId) {
      environmentResponses = environmentResponses.filter((response) => response.surveyId === surveyId);
    }
    return responses.successResponse(environmentResponses);
  } catch (error) {
    if (error instanceof DatabaseError) {
      return responses.badRequestResponse(error.message);
    }
    throw error;
  }
}

// Please use the client API to create a new response
