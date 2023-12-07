"use server";

interface LinkformEmailData {
  formId: string;
  email: string;
  formData?: {
    name?: string;
    subheading?: string;
  } | null;
}

interface TformPinValidationResponse {
  error?: TformPinValidationResponseError;
  form?: Tform;
}

import { TformPinValidationResponseError } from "@/app/s/[formId]/types";
import { sendLinkformToVerifiedEmail } from "@/app/lib/email";
import { verifyTokenForLinkform } from "@fastform/lib/jwt";
import { getform } from "@fastform/lib/form/service";
import { Tform } from "@fastform/types/forms";

export async function sendLinkformEmailAction(data: LinkformEmailData) {
  if (!data.formData) {
    throw new Error("No form data provided");
  }
  return await sendLinkformToVerifiedEmail(data);
}
export async function verifyTokenAction(token: string, formId: string): Promise<boolean> {
  return await verifyTokenForLinkform(token, formId);
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
