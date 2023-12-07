import { TActionClassNoCodeConfig } from "@fastform/types/actionClasses";
import { TIntegrationConfig } from "@fastform/types/integration";
import { TResponseData, TResponseMeta, TResponsePersonAttributes } from "@fastform/types/responses";
import {
  TformWelcomeCard,
  TformClosedMessage,
  TformHiddenFields,
  TformProductOverwrites,
  TformStyling,
  TformQuestions,
  TformSingleUse,
  TformThankYouCard,
  TformVerifyEmail,
} from "@fastform/types/forms";
import { TTeamBilling } from "@fastform/types/teams";
import { TUserNotificationSettings } from "@fastform/types/users";

declare global {
  namespace PrismaJson {
    export type ActionProperties = { [key: string]: string };
    export type ActionClassNoCodeConfig = TActionClassNoCodeConfig;
    export type IntegrationConfig = TIntegrationConfig;
    export type ResponseData = TResponseData;
    export type ResponseMeta = TResponseMeta;
    export type ResponsePersonAttributes = TResponsePersonAttributes;
    export type welcomeCard = TformWelcomeCard;
    export type formQuestions = TformQuestions;
    export type formThankYouCard = TformThankYouCard;
    export type formHiddenFields = TformHiddenFields;
    export type formProductOverwrites = TformProductOverwrites;
    export type formStyling = TformStyling;
    export type formClosedMessage = TformClosedMessage;
    export type formSingleUse = TformSingleUse;
    export type formVerifyEmail = TformVerifyEmail;
    export type TeamBilling = TTeamBilling;
    export type UserNotificationSettings = TUserNotificationSettings;
  }
}
