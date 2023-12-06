"use server";

import { createSurvey } from "@fastform/lib/survey/service";
import { authOptions } from "@fastform/lib/authOptions";
import { getServerSession } from "next-auth";
import { hasUserEnvironmentAccess } from "@fastform/lib/environment/auth";
import { AuthorizationError } from "@fastform/types/errors";
import { TSurveyInput } from "@fastform/types/surveys";

export async function createSurveyAction(environmentId: string, surveyBody: TSurveyInput) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await hasUserEnvironmentAccess(session.user.id, environmentId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await createSurvey(environmentId, surveyBody);
}
