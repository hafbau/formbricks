"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { canUserAccessSurvey, verifyUserRoleAccess } from "@fastform/lib/form/auth";
import { deleteSurvey, getSurvey, updateSurvey } from "@fastform/lib/form/service";
import { formatSurveyDateFields } from "@fastform/lib/form/util";
import { AuthorizationError } from "@fastform/types/errors";
import { TSurvey } from "@fastform/types/surveys";
import { getServerSession } from "next-auth";

export async function updateSurveyAction(form: TSurvey): Promise<TSurvey> {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessSurvey(session.user.id, form.id);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const { hasCreateOrUpdateAccess } = await verifyUserRoleAccess(form.environmentId, session.user.id);
  if (!hasCreateOrUpdateAccess) throw new AuthorizationError("Not authorized");

  const _survey = {
    ...form,
    ...formatSurveyDateFields(form),
  };

  return await updateSurvey(_survey);
}

export const deleteSurveyAction = async (surveyId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessSurvey(session.user.id, surveyId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const form = await getSurvey(surveyId);
  const { hasDeleteAccess } = await verifyUserRoleAccess(form!.environmentId, session.user.id);
  if (!hasDeleteAccess) throw new AuthorizationError("Not authorized");

  await deleteSurvey(surveyId);
};
