import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { sendToPipeline } from "@/app/lib/pipelines";
import { DatabaseError, InvalidInputError, ResourceNotFoundError } from "@fastform/types/errors";
import { getSurvey } from "@fastform/lib/form/service";
import { updateResponse } from "@fastform/lib/response/service";
import { ZResponseUpdateInput } from "@fastform/types/responses";
import { NextResponse } from "next/server";
import { getPerson } from "@fastform/lib/person/service";

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

export async function PUT(
  request: Request,
  { params }: { params: { responseId: string } }
): Promise<NextResponse> {
  const { responseId } = params;

  if (!responseId) {
    return responses.badRequestResponse("Response ID is missing", undefined, true);
  }

  const responseUpdate = await request.json();

  // legacy workaround for fastform-js 1.2.0 & 1.2.1
  if (responseUpdate.personId && typeof responseUpdate.personId === "string") {
    const person = await getPerson(responseUpdate.personId);
    responseUpdate.userId = person?.userId;
    delete responseUpdate.personId;
  }

  const inputValidation = ZResponseUpdateInput.safeParse(responseUpdate);

  if (!inputValidation.success) {
    return responses.badRequestResponse(
      "Fields are missing or incorrectly formatted",
      transformErrorToDetails(inputValidation.error),
      true
    );
  }

  // update response
  let response;
  try {
    response = await updateResponse(responseId, inputValidation.data);
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return responses.notFoundResponse("Response", responseId, true);
    }
    if (error instanceof InvalidInputError) {
      return responses.badRequestResponse(error.message);
    }
    if (error instanceof DatabaseError) {
      console.error(error);
      return responses.internalServerErrorResponse(error.message);
    }
  }

  // get form to get environmentId
  let form;
  try {
    form = await getSurvey(response.surveyId);
  } catch (error) {
    if (error instanceof InvalidInputError) {
      return responses.badRequestResponse(error.message);
    }
    if (error instanceof DatabaseError) {
      console.error(error);
      return responses.internalServerErrorResponse(error.message);
    }
  }

  // send response update to pipeline
  // don't await to not block the response
  sendToPipeline({
    event: "responseUpdated",
    environmentId: form.environmentId,
    surveyId: form.id,
    response,
  });

  if (response.finished) {
    // send response to pipeline
    // don't await to not block the response
    sendToPipeline({
      event: "responseFinished",
      environmentId: form.environmentId,
      surveyId: form.id,
      response: response,
    });
  }
  return responses.successResponse({}, true);
}
