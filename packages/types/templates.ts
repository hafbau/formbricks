import { z } from "zod";
import { ZformWelcomeCard, ZformHiddenFields, ZformQuestions, ZformThankYouCard } from "./forms";
import { ZProfileObjective } from "./profile";

export const ZTemplate = z.object({
  name: z.string(),
  description: z.string(),
  icon: z.any().optional(),
  category: z
    .enum(["Product Experience", "Exploration", "Growth", "Increase Revenue", "Customer Success"])
    .optional(),
  objectives: z.array(ZProfileObjective).optional(),
  preset: z.object({
    name: z.string(),
    welcomeCard: ZformWelcomeCard,
    questions: ZformQuestions,
    thankYouCard: ZformThankYouCard,
    hiddenFields: ZformHiddenFields,
  }),
});

export type TTemplate = z.infer<typeof ZTemplate>;
