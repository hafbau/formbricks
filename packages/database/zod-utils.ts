import z from "zod";

export const ZActionProperties = z.record(z.string());
export { ZActionClassNoCodeConfig } from "@fastform/types/actionClasses";
export { ZIntegrationConfig } from "@fastform/types/integration";

export {
  ZResponseData,
  ZResponsePersonAttributes,
  ZResponseMeta,
  ZResponseTtc,
} from "@fastform/types/responses";

export {
  ZSurveyWelcomeCard,
  ZSurveyQuestions,
  ZSurveyThankYouCard,
  ZSurveyHiddenFields,
  ZSurveyClosedMessage,
  ZSurveyProductOverwrites,
  ZSurveyStyling,
  ZSurveyVerifyEmail,
  ZSurveySingleUse,
} from "@fastform/types/surveys";

export { ZTeamBilling } from "@fastform/types/teams";
export { ZUserNotificationSettings } from "@fastform/types/users";
