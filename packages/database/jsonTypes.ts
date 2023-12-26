import { TActionClassNoCodeConfig } from "@fastform/types/actionClasses";
import { TIntegrationConfig } from "@fastform/types/integration";
import { TResponseData, TResponseMeta, TResponsePersonAttributes } from "@fastform/types/responses";
import {
  TFormWelcomeCard,
  TFormClosedMessage,
  TFormHiddenFields,
  TFormProductOverwrites,
  TFormStyling,
  TFormQuestions,
  TFormSingleUse,
  TFormThankYouCard,
  TFormVerifyEmail,
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
    export type welcomeCard = TFormWelcomeCard;
    export type formQuestions = TFormQuestions;
    export type formThankYouCard = TFormThankYouCard;
    export type formHiddenFields = TFormHiddenFields;
    export type formProductOverwrites = TFormProductOverwrites;
    export type formStyling = TFormStyling;
    export type formClosedMessage = TFormClosedMessage;
    export type formSingleUse = TFormSingleUse;
    export type formVerifyEmail = TFormVerifyEmail;
    export type TeamBilling = TTeamBilling;
    export type UserNotificationSettings = TUserNotificationSettings;
  }
}
