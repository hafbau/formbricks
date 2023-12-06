"use server";

import { getServerSession } from "next-auth";
import { AuthorizationError } from "@fastform/types/errors";
import { authOptions } from "@fastform/lib/authOptions";
import { getSurveysByAttributeClassId } from "@fastform/lib/form/service";
import { canUserAccessAttributeClass } from "@fastform/lib/attributeClass/auth";

export const GetActiveInactiveSurveysAction = async (
  attributeClassId: string
): Promise<{ activeSurveys: string[]; inactiveSurveys: string[] }> => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessAttributeClass(session.user.id, attributeClassId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const surveys = await getSurveysByAttributeClassId(attributeClassId);
  const response = {
    activeSurveys: surveys.filter((s) => s.status === "inProgress").map((form) => form.name),
    inactiveSurveys: surveys.filter((s) => s.status !== "inProgress").map((form) => form.name),
  };
  return response;
};
