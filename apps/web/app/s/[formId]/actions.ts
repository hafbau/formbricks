"use server";

interface LinkFormEmailData {
  formId: string;
  email: string;
  formData?: {
    name?: string;
    subheading?: string;
  } | null;
}

interface TformPinValidationResponse {
  error?: TformPinValidationResponseError;
  form?: TForm;
}

import { TformPinValidationResponseError } from "@/app/s/[formId]/types";
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
): Promise<TformPinValidationResponse> {
  try {
    const form = await getform(formId);
    if (!form) return { error: TformPinValidationResponseError.NOT_FOUND };

    const originalPin = form.pin?.toString();

    if (!originalPin) return { form };

    if (originalPin !== pin) return { error: TformPinValidationResponseError.INCORRECT_PIN };

    return { form };
  } catch (error) {
    return { error: TformPinValidationResponseError.INTERNAL_SERVER_ERROR };
  }
}
