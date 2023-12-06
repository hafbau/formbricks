"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { getSpreadSheets } from "@fastform/lib/googleSheet/service";
import { getServerSession } from "next-auth";

import { hasUserEnvironmentAccess } from "@fastform/lib/environment/auth";
import { AuthorizationError } from "@fastform/types/errors";

export async function refreshSheetAction(environmentId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await hasUserEnvironmentAccess(session.user.id, environmentId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await getSpreadSheets(environmentId);
}
