import { getUpdatedState } from "@/app/api/v1/(legacy)/js/sync/lib/sync";
import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { createPerson, getPersonByUserId } from "@fastform/lib/person/service";
import { ZJsPeopleUserIdInput } from "@fastform/types/js";
import { NextResponse } from "next/server";

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const jsonInput = await req.json();

    // validate using zod
    const inputValidation = ZJsPeopleUserIdInput.safeParse(jsonInput);

    if (!inputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(inputValidation.error),
        true
      );
    }

    const { environmentId, userId } = inputValidation.data;

    let person = await getPersonByUserId(environmentId, userId);
    if (!person) {
      person = await createPerson(environmentId, userId);
    }

    const personClient = {
      id: person.id,
      userId: person.userId,
    };

    const state = await getUpdatedState(environmentId, person.id);
    return responses.successResponse({ ...state, person: personClient }, true);
  } catch (error) {
    console.error(error);
    return responses.internalServerErrorResponse("Unable to handle the request: " + error.message, true);
  }
}
