"use server";
import { authOptions } from "@fastform/lib/authOptions";
import { AuthorizationError } from "@fastform/types/errors";
import { getServerSession } from "next-auth";
import { prisma } from "@fastform/database";
import { TUserNotificationSettings } from "@fastform/types/users";

export async function updateNotificationSettingsAction(notificationSettings: TUserNotificationSettings) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new AuthorizationError("Not authenticated");
  }

  // update user with notification settings
  await prisma.user.update({
    where: { id: session.user.id },
    data: { notificationSettings },
  });
}
