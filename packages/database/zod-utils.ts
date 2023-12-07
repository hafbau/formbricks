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
  ZformWelcomeCard,
  ZformQuestions,
  ZformThankYouCard,
  ZformHiddenFields,
  ZformClosedMessage,
  ZformProductOverwrites,
  ZformStyling,
  ZformVerifyEmail,
  ZformSingleUse,
} from "@fastform/types/forms";

export { ZTeamBilling } from "@fastform/types/teams";
export { ZUserNotificationSettings } from "@fastform/types/users";
