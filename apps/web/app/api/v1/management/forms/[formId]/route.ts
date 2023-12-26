import { responses } from "@/app/lib/api/response";
import { NextResponse } from "next/server";
import { getform, updateform, deleteform } from "@fastform/lib/form/service";
import { TForm, Zform } from "@fastform/types/forms";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { authenticateRequest } from "@/app/api/v1/auth";
import { handleErrorResponse } from "@/app/api/v1/auth";

async function fetchAndAuthorizeform(authentication: any, formId: string): Promise<TForm | null> {
  const form = await getform(formId);
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
  { params }: { params: { formId: string } }
): Promise<NextResponse> {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const form = await fetchAndAuthorizeform(authentication, params.formId);
    if (form) {
      return responses.successResponse(form);
    }
    return responses.notFoundResponse("Form", params.formId);
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { formId: string } }
): Promise<NextResponse> {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const form = await fetchAndAuthorizeform(authentication, params.formId);
    if (!form) {
      return responses.notFoundResponse("Form", params.formId);
    }
    const deletedform = await deleteform(params.formId);
    return responses.successResponse(deletedform);
  } catch (error) {
    return handleErrorResponse(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { formId: string } }
): Promise<NextResponse> {
  try {
    const authentication = await authenticateRequest(request);
    if (!authentication) return responses.notAuthenticatedResponse();
    const form = await fetchAndAuthorizeform(authentication, params.formId);
    if (!form) {
      return responses.notFoundResponse("Form", params.formId);
    }
    const formUpdate = await request.json();
    const inputValidation = Zform.safeParse({
      ...form,
      ...formUpdate,
    });
    if (!inputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(inputValidation.error)
      );
    }
    return responses.successResponse(await updateform(inputValidation.data));
  } catch (error) {
    return handleErrorResponse(error);
  }
}
