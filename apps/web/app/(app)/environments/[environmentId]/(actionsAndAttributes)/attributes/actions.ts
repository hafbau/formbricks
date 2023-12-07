"use server";

import { getServerSession } from "next-auth";
import { AuthorizationError } from "@fastform/types/errors";
import { authOptions } from "@fastform/lib/authOptions";
import { getformsByAttributeClassId } from "@fastform/lib/form/service";
import { canUserAccessAttributeClass } from "@fastform/lib/attributeClass/auth";

export const GetActiveInactiveformsAction = async (
  attributeClassId: string
): Promise<{ activeforms: string[]; inactiveforms: string[] }> => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessAttributeClass(session.user.id, attributeClassId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const forms = await getformsByAttributeClassId(attributeClassId);
  const response = {
    activeforms: forms.filter((s) => s.status === "inProgress").map((form) => form.name),
    inactiveforms: forms.filter((s) => s.status !== "inProgress").map((form) => form.name),
  };
  return response;
};
