"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { hasUserEnvironmentAccess } from "@fastform/lib/environment/auth";
import { createActionClass, deleteActionClass, updateActionClass } from "@fastform/lib/actionClass/service";
import { canUserUpdateActionClass, verifyUserRoleAccess } from "@fastform/lib/actionClass/auth";
import { getServerSession } from "next-auth";
import { TActionClassInput } from "@fastform/types/actionClasses";

import {
  getActionCountInLast24Hours,
  getActionCountInLast7Days,
  getActionCountInLastHour,
} from "@fastform/lib/action/service";
import { getformsByActionClassId } from "@fastform/lib/form/service";
import { AuthorizationError } from "@fastform/types/errors";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";

export async function deleteActionClassAction(environmentId, actionClassId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const team = await getTeamByEnvironmentId(environmentId);

  if (!team) {
    throw new Error("Team not found");
  }

  const isAuthorized = await canUserUpdateActionClass(session.user.id, actionClassId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const { hasDeleteAccess } = await verifyUserRoleAccess(environmentId, session.user.id);
  if (!hasDeleteAccess) throw new AuthorizationError("Not authorized");

  await deleteActionClass(environmentId, actionClassId);
}

export async function updateActionClassAction(
  environmentId: string,
  actionClassId: string,
  updatedAction: Partial<TActionClassInput>
) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const team = await getTeamByEnvironmentId(environmentId);

  if (!team) {
    throw new Error("Team not found");
  }

  const isAuthorized = await canUserUpdateActionClass(session.user.id, actionClassId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const { hasCreateOrUpdateAccess } = await verifyUserRoleAccess(environmentId, session.user.id);
  if (!hasCreateOrUpdateAccess) throw new AuthorizationError("Not authorized");

  return await updateActionClass(environmentId, actionClassId, updatedAction);
}

export async function createActionClassAction(action: TActionClassInput) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await hasUserEnvironmentAccess(session.user.id, action.environmentId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await createActionClass(action.environmentId, action);
}

export const getActionCountInLastHourAction = async (actionClassId: string, environmentId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const team = await getTeamByEnvironmentId(environmentId);

  if (!team) {
    throw new Error("Team not found");
  }

  const isAuthorized = await canUserUpdateActionClass(session.user.id, actionClassId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await getActionCountInLastHour(actionClassId);
};

export const getActionCountInLast24HoursAction = async (actionClassId: string, environmentId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const team = await getTeamByEnvironmentId(environmentId);

  if (!team) {
    throw new Error("Team not found");
  }

  const isAuthorized = await canUserUpdateActionClass(session.user.id, actionClassId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await getActionCountInLast24Hours(actionClassId);
};

export const getActionCountInLast7DaysAction = async (actionClassId: string, environmentId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const team = await getTeamByEnvironmentId(environmentId);

  if (!team) {
    throw new Error("Team not found");
  }

  const isAuthorized = await canUserUpdateActionClass(session.user.id, actionClassId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await getActionCountInLast7Days(actionClassId);
};

export const GetActiveInactiveformsAction = async (
  actionClassId: string,
  environmentId: string
): Promise<{ activeforms: string[]; inactiveforms: string[] }> => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const team = await getTeamByEnvironmentId(environmentId);

  if (!team) {
    throw new Error("Team not found");
  }

  const isAuthorized = await canUserUpdateActionClass(session.user.id, actionClassId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const forms = await getformsByActionClassId(actionClassId);
  const response = {
    activeforms: forms.filter((s) => s.status === "inProgress").map((form) => form.name),
    inactiveforms: forms.filter((s) => s.status !== "inProgress").map((form) => form.name),
  };
  return response;
};
