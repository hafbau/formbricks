"use client";

import { Switch } from "@fastform/ui/Switch";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateNotificationSettingsAction } from "../actions";
import { TUserNotificationSettings } from "@fastform/types/users";
import { useState } from "react";

interface NotificationSwitchProps {
  formOrProductId: string;
  notificationSettings: TUserNotificationSettings;
  notificationType: "alert" | "weeklySummary";
}

export function NotificationSwitch({
  formOrProductId,
  notificationSettings,
  notificationType,
}: NotificationSwitchProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Switch
      id="notification-switch"
      aria-label="toggle notification settings"
      checked={notificationSettings[notificationType][formOrProductId]}
      disabled={isLoading}
      onCheckedChange={async () => {
        setIsLoading(true);
        // update notificiation settings
        const updatedNotificationSettings = { ...notificationSettings };
        updatedNotificationSettings[notificationType][formOrProductId] =
          !updatedNotificationSettings[notificationType][formOrProductId];
        await updateNotificationSettingsAction(notificationSettings);
        setIsLoading(false);
        toast.success(`Notification settings updated`, { id: "notification-switch" });
        router.refresh();
      }}
    />
  );
}
