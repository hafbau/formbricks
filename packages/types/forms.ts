import { z } from "zod";
import { ZAllowedFileExtension, ZColor, ZPlacement } from "./common";
import { TPerson } from "./people";

export const ZformThankYouCard = z.object({
  enabled: z.boolean(),
  headline: z.optional(z.string()),
  subheader: z.optional(z.string()),
});

export enum TformQuestionType {
  FileUpload = "fileUpload",
  OpenText = "openText",
  MultipleChoiceSingle = "multipleChoiceSingle",
  MultipleChoiceMulti = "multipleChoiceMulti",
  NPS = "nps",
  CTA = "cta",
  Rating = "rating",
  Consent = "consent",
  PictureSelection = "pictureSelection",
}

export const ZformWelcomeCard = z.object({
  enabled: z.boolean(),
  headline: z.optional(z.string()),
  html: z.string().optional(),
  fileUrl: z.string().optional(),
  buttonLabel: z.string().optional(),
  timeToFinish: z.boolean().default(true),
  showResponseCount: z.boolean().default(false),
});

export const ZformHiddenFields = z.object({
  enabled: z.boolean(),
  fieldIds: z.optional(z.array(z.string())),
});

export const ZformProductOverwrites = z.object({
  brandColor: ZColor.nullish(),
  highlightBorderColor: ZColor.nullish(),
  placement: ZPlacement.nullish(),
  clickOutsideClose: z.boolean().nullish(),
  darkOverlay: z.boolean().nullish(),
});

export type TformProductOverwrites = z.infer<typeof ZformProductOverwrites>;

export const ZformBackgroundBgType = z.enum(["animation", "color", "image"]);

export type TformBackgroundBgType = z.infer<typeof ZformBackgroundBgType>;

export const ZformStylingBackground = z.object({
  bg: z.string().nullish(),
  bgType: z.enum(["animation", "color", "image"]).nullish(),
  brightness: z.number().nullish(),
});

export type TformStylingBackground = z.infer<typeof ZformStylingBackground>;

export const ZformStyling = z.object({
  background: ZformStylingBackground.nullish(),
});

export type TformStyling = z.infer<typeof ZformStyling>;

export const ZformClosedMessage = z
  .object({
    enabled: z.boolean().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
  })
  .nullable()
  .optional();

export const ZformSingleUse = z
  .object({
    enabled: z.boolean(),
    heading: z.optional(z.string()),
    subheading: z.optional(z.string()),
    isEncrypted: z.boolean(),
  })
  .nullable();

export type TformSingleUse = z.infer<typeof ZformSingleUse>;

export const ZformVerifyEmail = z
  .object({
    name: z.optional(z.string()),
    subheading: z.optional(z.string()),
  })
  .optional();

export type TformVerifyEmail = z.infer<typeof ZformVerifyEmail>;

export type TformWelcomeCard = z.infer<typeof ZformWelcomeCard>;

export type TformThankYouCard = z.infer<typeof ZformThankYouCard>;

export type TformHiddenFields = z.infer<typeof ZformHiddenFields>;

export type TformClosedMessage = z.infer<typeof ZformClosedMessage>;

export const ZformChoice = z.object({
  id: z.string(),
  label: z.string(),
});

export const ZformPictureChoice = z.object({
  id: z.string(),
  imageUrl: z.string(),
});

export type TformChoice = z.infer<typeof ZformChoice>;

export const ZformLogicCondition = z.enum([
  "accepted",
  "clicked",
  "submitted",
  "skipped",
  "equals",
  "notEquals",
  "lessThan",
  "lessEqual",
  "greaterThan",
  "greaterEqual",
  "includesAll",
  "includesOne",
  "uploaded",
  "notUploaded",
]);

export type TformLogicCondition = z.infer<typeof ZformLogicCondition>;

export const ZformLogicBase = z.object({
  condition: ZformLogicCondition.optional(),
  value: z.union([z.string(), z.array(z.string())]).optional(),
  destination: z.union([z.string(), z.literal("end")]).optional(),
});

export const ZformFileUploadLogic = ZformLogicBase.extend({
  condition: z.enum(["uploaded", "notUploaded"]).optional(),
  value: z.undefined(),
});

export const ZformOpenTextLogic = ZformLogicBase.extend({
  condition: z.enum(["submitted", "skipped"]).optional(),
  value: z.undefined(),
});

export const ZformConsentLogic = ZformLogicBase.extend({
  condition: z.enum(["skipped", "accepted"]).optional(),
  value: z.undefined(),
});

export const ZformMultipleChoiceSingleLogic = ZformLogicBase.extend({
  condition: z.enum(["submitted", "skipped", "equals", "notEquals"]).optional(),
  value: z.string().optional(),
});

export const ZformMultipleChoiceMultiLogic = ZformLogicBase.extend({
  condition: z.enum(["submitted", "skipped", "includesAll", "includesOne", "equals"]).optional(),
  value: z.union([z.array(z.string()), z.string()]).optional(),
});

export const ZformNPSLogic = ZformLogicBase.extend({
  condition: z
    .enum([
      "equals",
      "notEquals",
      "lessThan",
      "lessEqual",
      "greaterThan",
      "greaterEqual",
      "submitted",
      "skipped",
    ])
    .optional(),
  value: z.union([z.string(), z.number()]).optional(),
});

const ZformCTALogic = ZformLogicBase.extend({
  // "submitted" condition is legacy and should be removed later
  condition: z.enum(["clicked", "submitted", "skipped"]).optional(),
  value: z.undefined(),
});

const ZformRatingLogic = ZformLogicBase.extend({
  condition: z
    .enum([
      "equals",
      "notEquals",
      "lessThan",
      "lessEqual",
      "greaterThan",
      "greaterEqual",
      "submitted",
      "skipped",
    ])
    .optional(),
  value: z.union([z.string(), z.number()]).optional(),
});

const ZformPictureSelectionLogic = ZformLogicBase.extend({
  condition: z.enum(["submitted", "skipped"]).optional(),
  value: z.undefined(),
});

export const ZformLogic = z.union([
  ZformOpenTextLogic,
  ZformConsentLogic,
  ZformMultipleChoiceSingleLogic,
  ZformMultipleChoiceMultiLogic,
  ZformNPSLogic,
  ZformCTALogic,
  ZformRatingLogic,
  ZformPictureSelectionLogic,
  ZformFileUploadLogic,
]);

export type TformLogic = z.infer<typeof ZformLogic>;

const ZformQuestionBase = z.object({
  id: z.string(),
  type: z.string(),
  headline: z.string(),
  subheader: z.string().optional(),
  imageUrl: z.string().optional(),
  required: z.boolean(),
  buttonLabel: z.string().optional(),
  backButtonLabel: z.string().optional(),
  scale: z.enum(["number", "smiley", "star"]).optional(),
  range: z.union([z.literal(5), z.literal(3), z.literal(4), z.literal(7), z.literal(10)]).optional(),
  logic: z.array(ZformLogic).optional(),
  isDraft: z.boolean().optional(),
});

export const ZformFileUploadQuestion = ZformQuestionBase.extend({
  type: z.literal(TformQuestionType.FileUpload),
  allowMultipleFiles: z.boolean(),
  maxSizeInMB: z.number().optional(),
  allowedFileExtensions: z.array(ZAllowedFileExtension).optional(),
  logic: z.array(ZformFileUploadLogic).optional(),
});

export type TformFileUploadQuestion = z.infer<typeof ZformFileUploadQuestion>;

export const ZformOpenTextQuestionInputType = z.enum(["text", "email", "url", "number", "phone"]);
export type TformOpenTextQuestionInputType = z.infer<typeof ZformOpenTextQuestionInputType>;

export const ZformOpenTextQuestion = ZformQuestionBase.extend({
  type: z.literal(TformQuestionType.OpenText),
  placeholder: z.string().optional(),
  longAnswer: z.boolean().optional(),
  logic: z.array(ZformOpenTextLogic).optional(),
  inputType: ZformOpenTextQuestionInputType.optional().default("text"),
});

export type TformOpenTextQuestion = z.infer<typeof ZformOpenTextQuestion>;

export const ZformConsentQuestion = ZformQuestionBase.extend({
  type: z.literal(TformQuestionType.Consent),
  html: z.string().optional(),
  label: z.string(),
  dismissButtonLabel: z.string().optional(),
  placeholder: z.string().optional(),
  logic: z.array(ZformConsentLogic).optional(),
});

export type TformConsentQuestion = z.infer<typeof ZformConsentQuestion>;

export const ZformMultipleChoiceSingleQuestion = ZformQuestionBase.extend({
  type: z.literal(TformQuestionType.MultipleChoiceSingle),
  choices: z.array(ZformChoice),
  logic: z.array(ZformMultipleChoiceSingleLogic).optional(),
  shuffleOption: z.enum(["none", "all", "exceptLast"]).optional(),
});

export type TformMultipleChoiceSingleQuestion = z.infer<typeof ZformMultipleChoiceSingleQuestion>;

export const ZformMultipleChoiceMultiQuestion = ZformQuestionBase.extend({
  type: z.literal(TformQuestionType.MultipleChoiceMulti),
  choices: z.array(ZformChoice),
  logic: z.array(ZformMultipleChoiceMultiLogic).optional(),
  shuffleOption: z.enum(["none", "all", "exceptLast"]).optional(),
});

export type TformMultipleChoiceMultiQuestion = z.infer<typeof ZformMultipleChoiceMultiQuestion>;

export const ZformNPSQuestion = ZformQuestionBase.extend({
  type: z.literal(TformQuestionType.NPS),
  lowerLabel: z.string(),
  upperLabel: z.string(),
  logic: z.array(ZformNPSLogic).optional(),
});

export type TformNPSQuestion = z.infer<typeof ZformNPSQuestion>;

export const ZformCTAQuestion = ZformQuestionBase.extend({
  type: z.literal(TformQuestionType.CTA),
  html: z.string().optional(),
  buttonUrl: z.string().optional(),
  buttonExternal: z.boolean(),
  dismissButtonLabel: z.string().optional(),
  logic: z.array(ZformCTALogic).optional(),
});

export type TformCTAQuestion = z.infer<typeof ZformCTAQuestion>;

// export const ZformWelcomeQuestion = ZformQuestionBase.extend({
//   type: z.literal(TformQuestionType.Welcome),
//   html: z.string().optional(),
//   fileUrl: z.string().optional(),
//   buttonUrl: z.string().optional(),
//   timeToFinish: z.boolean().default(false),
//   logic: z.array(ZformCTALogic).optional(),
// });

// export type TformWelcomeQuestion = z.infer<typeof ZformWelcomeQuestion>;

export const ZformRatingQuestion = ZformQuestionBase.extend({
  type: z.literal(TformQuestionType.Rating),
  scale: z.enum(["number", "smiley", "star"]),
  range: z.union([z.literal(5), z.literal(3), z.literal(4), z.literal(7), z.literal(10)]),
  lowerLabel: z.string(),
  upperLabel: z.string(),
  logic: z.array(ZformRatingLogic).optional(),
});

export type TformRatingQuestion = z.infer<typeof ZformRatingQuestion>;

export const ZformPictureSelectionQuestion = ZformQuestionBase.extend({
  type: z.literal(TformQuestionType.PictureSelection),
  allowMulti: z.boolean().optional().default(false),
  choices: z.array(ZformPictureChoice),
  logic: z.array(ZformPictureSelectionLogic).optional(),
});

export type TformPictureSelectionQuestion = z.infer<typeof ZformPictureSelectionQuestion>;

export const ZformQuestion = z.union([
  ZformOpenTextQuestion,
  ZformConsentQuestion,
  ZformMultipleChoiceSingleQuestion,
  ZformMultipleChoiceMultiQuestion,
  ZformNPSQuestion,
  ZformCTAQuestion,
  ZformRatingQuestion,
  ZformPictureSelectionQuestion,
  ZformFileUploadQuestion,
]);

export type TformQuestion = z.infer<typeof ZformQuestion>;

export const ZformQuestions = z.array(ZformQuestion);

export type TformQuestions = z.infer<typeof ZformQuestions>;

export const ZformAttributeFilter = z.object({
  attributeClassId: z.string().cuid2(),
  condition: z.enum(["equals", "notEquals"]),
  value: z.string(),
});

export type TformAttributeFilter = z.infer<typeof ZformAttributeFilter>;

const ZformDisplayOption = z.enum(["displayOnce", "displayMultiple", "respondMultiple"]);

export type TformDisplayOption = z.infer<typeof ZformDisplayOption>;

const ZformType = z.enum(["web", "email", "link", "mobile"]);

export type TformType = z.infer<typeof ZformType>;

const ZFormStatus = z.enum(["draft", "inProgress", "paused", "completed"]);

export type TFormStatus = z.infer<typeof ZFormStatus>;

export const Zform = z.object({
  id: z.string().cuid2(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  type: ZformType,
  environmentId: z.string(),
  status: ZFormStatus,
  attributeFilters: z.array(ZformAttributeFilter),
  displayOption: ZformDisplayOption,
  autoClose: z.number().nullable(),
  triggers: z.array(z.string()),
  redirectUrl: z.string().url().nullable(),
  recontactDays: z.number().nullable(),
  welcomeCard: ZformWelcomeCard,
  questions: ZformQuestions,
  thankYouCard: ZformThankYouCard,
  hiddenFields: ZformHiddenFields,
  delay: z.number(),
  autoComplete: z.number().nullable(),
  closeOnDate: z.date().nullable(),
  productOverwrites: ZformProductOverwrites.nullable(),
  styling: ZformStyling.nullable(),
  formClosedMessage: ZformClosedMessage.nullable(),
  singleUse: ZformSingleUse.nullable(),
  verifyEmail: ZformVerifyEmail.nullable(),
  pin: z.string().nullable().optional(),
});

export const ZformInput = z.object({
  name: z.string(),
  type: ZformType.optional(),
  status: ZFormStatus.optional(),
  displayOption: ZformDisplayOption.optional(),
  autoClose: z.number().optional(),
  redirectUrl: z.string().url().optional(),
  recontactDays: z.number().optional(),
  welcomeCard: ZformWelcomeCard.optional(),
  questions: ZformQuestions.optional(),
  thankYouCard: ZformThankYouCard.optional(),
  hiddenFields: ZformHiddenFields,
  delay: z.number().optional(),
  autoComplete: z.number().optional(),
  closeOnDate: z.date().optional(),
  formClosedMessage: ZformClosedMessage.optional(),
  verifyEmail: ZformVerifyEmail.optional(),
  attributeFilters: z.array(ZformAttributeFilter).optional(),
  triggers: z.array(z.string()).optional(),
});

export type TForm = z.infer<typeof Zform>;
export type TformDates = {
  createdAt: TForm["createdAt"];
  updatedAt: TForm["updatedAt"];
  closeOnDate: TForm["closeOnDate"];
};
export type TformInput = z.infer<typeof ZformInput>;

export const ZformTformQuestionType = z.union([
  z.literal("fileUpload"),
  z.literal("openText"),
  z.literal("multipleChoiceSingle"),
  z.literal("multipleChoiceMulti"),
  z.literal("nps"),
  z.literal("cta"),
  z.literal("rating"),
  z.literal("consent"),
  z.literal("pictureSelection"),
]);

export type TformTformQuestionType = z.infer<typeof ZformTformQuestionType>;

export interface TformQuestionSummary<T> {
  question: T;
  responses: {
    id: string;
    value: string | number | string[];
    updatedAt: Date;
    person: TPerson | null;
  }[];
}
