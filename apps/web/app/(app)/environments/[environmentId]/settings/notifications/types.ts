import { TUserNotificationSettings } from "@fastform/types/users";

export interface Membership {
  team: {
    id: string;
    name: string;
    products: {
      id: string;
      name: string;
      environments: {
        id: string;
        forms: {
          id: string;
          name: string;
        }[];
      }[];
    }[];
  };
}

export interface User {
  id: string;
  notificationSettings: TUserNotificationSettings;
}
