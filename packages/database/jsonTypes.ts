import { TActionClassNoCodeConfig } from "@fastform/types/actionClasses";
import { TIntegrationConfig } from "@fastform/types/integration";
import { TResponseData, TResponseMeta, TResponsePersonAttributes } from "@fastform/types/responses";
import {
  TSurveyWelcomeCard,
  TSurveyClosedMessage,
  TSurveyHiddenFields,
  TSurveyProductOverwrites,
  TSurveyStyling,
  TSurveyQuestions,
  TSurveySingleUse,
  TSurveyThankYouCard,
  TSurveyVerifyEmail,
} from "@fastform/types/surveys";
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
    export type welcomeCard = TSurveyWelcomeCard;
    export type SurveyQuestions = TSurveyQuestions;
    export type SurveyThankYouCard = TSurveyThankYouCard;
    export type SurveyHiddenFields = TSurveyHiddenFields;
    export type SurveyProductOverwrites = TSurveyProductOverwrites;
    export type SurveyStyling = TSurveyStyling;
    export type SurveyClosedMessage = TSurveyClosedMessage;
    export type SurveySingleUse = TSurveySingleUse;
    export type SurveyVerifyEmail = TSurveyVerifyEmail;
    export type TeamBilling = TTeamBilling;
    export type UserNotificationSettings = TUserNotificationSettings;
  }
}
