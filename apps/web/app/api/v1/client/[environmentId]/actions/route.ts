import { transformErrorToDetails } from "@/app/lib/api/validator";
import { responses } from "@/app/lib/api/response";
import { createAction } from "@fastform/lib/action/service";
import { ZActionInput } from "@fastform/types/actions";
import { NextResponse } from "next/server";

interface Context {
  params: {
    environmentId: string;
  };
}

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

export async function POST(req: Request, context: Context): Promise<NextResponse> {
  try {
    const jsonInput = await req.json();

    // validate using zod
    const inputValidation = ZActionInput.safeParse({
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

    await createAction(inputValidation.data);

    return responses.successResponse({}, true);
  } catch (error) {
    console.error(error);
    return responses.internalServerErrorResponse("Unable to handle the request: " + error.message, true);
  }
}
