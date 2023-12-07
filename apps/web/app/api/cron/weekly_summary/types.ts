import { TResponseData } from "@fastform/types/responses";
import { TformQuestion, TformStatus } from "@fastform/types/forms";
import { TUserNotificationSettings } from "@fastform/types/users";

export interface Insights {
  totalCompletedResponses: number;
  totalDisplays: number;
  totalResponses: number;
  completionRate: number;
  numLiveform: number;
}

export interface formResponse {
  [headline: string]: string | number | boolean | Date | string[];
}

export interface Form {
  id: string;
  name: string;
  responses: formResponse[];
  responseCount: number;
  status: string;
}

export interface NotificationResponse {
  environmentId: string;
  currentDate: Date;
  lastWeekDate: Date;
  productName: string;
  forms: Form[];
  insights: Insights;
}

// Prisma Types

type ResponseData = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  finished: boolean;
  data: TResponseData;
};

type DisplayData = {
  id: string;
};

type formData = {
  id: string;
  name: string;
  questions: TformQuestion[];
  status: TformStatus;
  responses: ResponseData[];
  displays: DisplayData[];
};

export type EnvironmentData = {
  id: string;
  forms: formData[];
};

type UserData = {
  email: string;
  notificationSettings: TUserNotificationSettings;
};

type MembershipData = {
  user: UserData;
};

type TeamData = {
  memberships: MembershipData[];
};

export type ProductData = {
  id: string;
  name: string;
  environments: EnvironmentData[];
  team: TeamData;
};
