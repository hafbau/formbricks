"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { createOrUpdateIntegration, deleteIntegration } from "@fastform/lib/integration/service";
import { getServerSession } from "next-auth";

import { canUserAccessIntegration } from "@fastform/lib/integration/auth";
import { AuthorizationError } from "@fastform/types/errors";
import { TIntegrationInput } from "@fastform/types/integration";

export async function createOrUpdateIntegrationAction(
  environmentId: string,
  integrationData: TIntegrationInput
) {
  return await createOrUpdateIntegration(environmentId, integrationData);
}

export async function deleteIntegrationAction(integrationId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessIntegration(session.user.id, integrationId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await deleteIntegration(integrationId);
}
