"use server";

interface LinkSurveyEmailData {
  surveyId: string;
  email: string;
  surveyData?: {
    name?: string;
    subheading?: string;
  } | null;
}

interface TSurveyPinValidationResponse {
  error?: TSurveyPinValidationResponseError;
  form?: TSurvey;
}

import { TSurveyPinValidationResponseError } from "@/app/s/[surveyId]/types";
import { sendLinkSurveyToVerifiedEmail } from "@/app/lib/email";
import { verifyTokenForLinkSurvey } from "@fastform/lib/jwt";
import { getSurvey } from "@fastform/lib/form/service";
import { TSurvey } from "@fastform/types/surveys";

export async function sendLinkSurveyEmailAction(data: LinkSurveyEmailData) {
  if (!data.surveyData) {
    throw new Error("No form data provided");
  }
  return await sendLinkSurveyToVerifiedEmail(data);
}
export async function verifyTokenAction(token: string, surveyId: string): Promise<boolean> {
  return await verifyTokenForLinkSurvey(token, surveyId);
}

export async function validateSurveyPinAction(
  surveyId: string,
  pin: string
): Promise<TSurveyPinValidationResponse> {
  try {
    const form = await getSurvey(surveyId);
    if (!form) return { error: TSurveyPinValidationResponseError.NOT_FOUND };

    const originalPin = form.pin?.toString();

    if (!originalPin) return { form };

    if (originalPin !== pin) return { error: TSurveyPinValidationResponseError.INCORRECT_PIN };

    return { form };
  } catch (error) {
    return { error: TSurveyPinValidationResponseError.INTERNAL_SERVER_ERROR };
  }
}
