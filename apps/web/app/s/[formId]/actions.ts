"use server";

interface LinkFormEmailData {
  formId: string;
  email: string;
  formData?: {
    name?: string;
    subheading?: string;
  } | null;
}

interface TFormPinValidationResponse {
  error?: TFormPinValidationResponseError;
  form?: TForm;
}

import { TFormPinValidationResponseError } from "@/app/s/[formId]/types";
import { sendLinkFormToVerifiedEmail } from "@/app/lib/email";
import { verifyTokenForLinkForm } from "@fastform/lib/jwt";
import { getform } from "@fastform/lib/form/service";
import { TForm } from "@fastform/types/forms";

export async function sendLinkFormEmailAction(data: LinkFormEmailData) {
  if (!data.formData) {
    throw new Error("No form data provided");
  }
  return await sendLinkFormToVerifiedEmail(data);
}
export async function verifyTokenAction(token: string, formId: string): Promise<boolean> {
  return await verifyTokenForLinkForm(token, formId);
}

export async function validateformPinAction(
  formId: string,
  pin: string
): Promise<TFormPinValidationResponse> {
  try {
    const form = await getform(formId);
    if (!form) return { error: TFormPinValidationResponseError.NOT_FOUND };

    const originalPin = form.pin?.toString();

    if (!originalPin) return { form };

    if (originalPin !== pin) return { error: TFormPinValidationResponseError.INCORRECT_PIN };

    return { form };
  } catch (error) {
    return { error: TFormPinValidationResponseError.INTERNAL_SERVER_ERROR };
  }
}
