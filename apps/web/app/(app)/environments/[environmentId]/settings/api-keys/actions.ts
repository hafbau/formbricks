"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { hasUserEnvironmentAccess } from "@fastform/lib/environment/auth";
import { deleteApiKey, createApiKey } from "@fastform/lib/apiKey/service";
import { canUserAccessApiKey } from "@fastform/lib/apiKey/auth";
import { TApiKeyCreateInput } from "@fastform/types/apiKeys";
import { getServerSession } from "next-auth";
import { AuthorizationError } from "@fastform/types/errors";

export async function deleteApiKeyAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessApiKey(session.user.id, id);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await deleteApiKey(id);
}
export async function createApiKeyAction(environmentId: string, apiKeyData: TApiKeyCreateInput) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await hasUserEnvironmentAccess(session.user.id, environmentId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await createApiKey(environmentId, apiKeyData);
}
