import fastform from "@fastform/js";
import { env } from "@fastform/lib/env.mjs";

export const formbricksEnabled =
  typeof env.NEXT_PUBLIC_FORMBRICKS_API_HOST && env.NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID;
const ttc = { onboarding: 0 };

export const createResponse = async (
  surveyId: string,
  userId: string,
  data: { [questionId: string]: any },
  finished: boolean = false
): Promise<any> => {
  const api = fastform.getApi();
  return await api.client.response.create({
    surveyId,
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

export const formbricksLogout = async () => {
  return await fastform.logout();
};
