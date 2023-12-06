"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { canUserAccessSurvey, verifyUserRoleAccess } from "@fastform/lib/survey/auth";
import { deleteSurvey, getSurvey, updateSurvey } from "@fastform/lib/survey/service";
import { formatSurveyDateFields } from "@fastform/lib/survey/util";
import { AuthorizationError } from "@fastform/types/errors";
import { TSurvey } from "@fastform/types/surveys";
import { getServerSession } from "next-auth";

export async function updateSurveyAction(survey: TSurvey): Promise<TSurvey> {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessSurvey(session.user.id, survey.id);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const { hasCreateOrUpdateAccess } = await verifyUserRoleAccess(survey.environmentId, session.user.id);
  if (!hasCreateOrUpdateAccess) throw new AuthorizationError("Not authorized");

  const _survey = {
    ...survey,
    ...formatSurveyDateFields(survey),
  };

  return await updateSurvey(_survey);
}

export const deleteSurveyAction = async (surveyId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessSurvey(session.user.id, surveyId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const survey = await getSurvey(surveyId);
  const { hasDeleteAccess } = await verifyUserRoleAccess(survey!.environmentId, session.user.id);
  if (!hasDeleteAccess) throw new AuthorizationError("Not authorized");

  await deleteSurvey(surveyId);
};
