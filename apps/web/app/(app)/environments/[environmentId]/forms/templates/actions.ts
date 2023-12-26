"use server";

import { createform } from "@fastform/lib/form/service";
import { authOptions } from "@fastform/lib/authOptions";
import { getServerSession } from "next-auth";
import { hasUserEnvironmentAccess } from "@fastform/lib/environment/auth";
import { AuthorizationError } from "@fastform/types/errors";
import { TFormInput } from "@fastform/types/forms";

export async function createformAction(environmentId: string, formBody: TFormInput) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await hasUserEnvironmentAccess(session.user.id, environmentId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await createform(environmentId, formBody);
}
