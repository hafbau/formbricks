"use server";

import { disableTwoFactorAuth, enableTwoFactorAuth, setupTwoFactorAuth } from "@fastform/lib/auth/service";
import { getServerSession } from "next-auth";
import { authOptions } from "@fastform/lib/authOptions";
import { updateProfile, deleteProfile } from "@fastform/lib/profile/service";
import { TProfileUpdateInput } from "@fastform/types/profile";
import { AuthorizationError } from "@fastform/types/errors";

export async function updateProfileAction(data: Partial<TProfileUpdateInput>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  return await updateProfile(session.user.id, data);
}

export async function deleteProfileAction() {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  return await deleteProfile(session.user.id);
}

export async function setupTwoFactorAuthAction(password: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Not authenticated");
  }

  if (!session.user.id) {
    throw new Error("User not found");
  }

  return await setupTwoFactorAuth(session.user.id, password);
}

export async function enableTwoFactorAuthAction(code: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Not authenticated");
  }

  if (!session.user.id) {
    throw new Error("User not found");
  }

  return await enableTwoFactorAuth(session.user.id, code);
}

type TDisableTwoFactorAuthParams = {
  code: string;
  password: string;
  backupCode?: string;
};
export async function disableTwoFactorAuthAction(params: TDisableTwoFactorAuthParams) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Not authenticated");
  }

  if (!session.user.id) {
    throw new Error("User not found");
  }

  return await disableTwoFactorAuth(session.user.id, params);
}

export async function updateAvatarAction(avatarUrl: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Not authenticated");
  }

  if (!session.user.id) {
    throw new Error("User not found");
  }

  return await updateProfile(session.user.id, { imageUrl: avatarUrl });
}
