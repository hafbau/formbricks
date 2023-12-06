"use server";
import { createTag } from "@fastform/lib/tag/service";
import { addTagToRespone, deleteTagOnResponse } from "@fastform/lib/tagOnResponse/service";
import { hasUserEnvironmentAccess } from "@fastform/lib/environment/auth";
import { authOptions } from "@fastform/lib/authOptions";
import { getServerSession } from "next-auth";
import { AuthorizationError } from "@fastform/types/errors";
import { canUserAccessTagOnResponse } from "@fastform/lib/tagOnResponse/auth";

export const createTagAction = async (environmentId: string, tagName: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await hasUserEnvironmentAccess(session.user.id, environmentId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await createTag(environmentId, tagName);
};

export const createTagToResponeAction = async (responseId: string, tagId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessTagOnResponse(session.user.id, tagId, responseId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await addTagToRespone(responseId, tagId);
};

export const deleteTagOnResponseAction = async (responseId: string, tagId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessTagOnResponse(session.user.id, tagId, responseId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await deleteTagOnResponse(responseId, tagId);
};
