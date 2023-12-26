import fastform from "@fastform/js";
import { env } from "@fastform/lib/env.mjs";

export const fastformEnabled =
  typeof env.NEXT_PUBLIC_FASTFORM_API_HOST && env.NEXT_PUBLIC_FASTFORM_ENVIRONMENT_ID;
const ttc = { onboarding: 0 };

export const createResponse = async (
  formId: string,
  userId: string,
  data: { [questionId: string]: any },
  finished: boolean = false
): Promise<any> => {
  const api = fastform.getApi();
  return await api.client.response.create({
    formId,
    userId,
    finished,
    data,
    ttc,
  });
};

export const updateResponse = async (
  responseId: string,
  data: { [questionId: string]: any },
  finished: boolean = false
): Promise<any> => {
  const api = fastform.getApi();
  return await api.client.response.update({
    responseId,
    finished,
    data,
    ttc,
  });
};

export const fastformLogout = async () => {
  return await fastform.logout();
};
