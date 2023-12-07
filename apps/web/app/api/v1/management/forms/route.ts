import { responses } from "@/app/lib/api/response";
import { authenticateRequest } from "@/app/api/v1/auth";
import { NextResponse } from "next/server";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { createform, getforms } from "@fastform/lib/form/service";
import { ZformInput } from "@fastform/types/forms";
import { DatabaseError } from "@fastform/types/errors";

export async function GET(request: Request) {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const forms = await getforms(authentication.environmentId!);
    return responses.successResponse(forms);
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
    const formInput = await request.json();
    const inputValidation = ZformInput.safeParse(formInput);

    if (!inputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(inputValidation.error),
        true
      );
    }

    const environmentId = authentication.environmentId;
    const formData = { ...inputValidation.data, environmentId: undefined };

    const form = await createform(environmentId, formData);
    return responses.successResponse(form);
  } catch (error) {
    if (error instanceof DatabaseError) {
      return responses.badRequestResponse(error.message);
    }
    throw error;
  }
}
