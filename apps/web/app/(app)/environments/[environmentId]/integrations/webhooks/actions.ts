"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { createWebhook, deleteWebhook, updateWebhook } from "@fastform/lib/webhook/service";
import { TWebhook, TWebhookInput } from "@fastform/types/webhooks";
import { getServerSession } from "next-auth";
import { AuthorizationError } from "@fastform/types/errors";
import { hasUserEnvironmentAccess } from "@fastform/lib/environment/auth";
import { canUserAccessWebhook } from "@fastform/lib/webhook/auth";

export const createWebhookAction = async (
  environmentId: string,
  webhookInput: TWebhookInput
): Promise<TWebhook> => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await hasUserEnvironmentAccess(session.user.id, environmentId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await createWebhook(environmentId, webhookInput);
};

export const deleteWebhookAction = async (id: string): Promise<TWebhook> => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessWebhook(session.user.id, id);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await deleteWebhook(id);
};

export const updateWebhookAction = async (
  environmentId: string,
  webhookId: string,
  webhookInput: Partial<TWebhookInput>
): Promise<TWebhook> => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessWebhook(session.user.id, webhookId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await updateWebhook(environmentId, webhookId, webhookInput);
};
