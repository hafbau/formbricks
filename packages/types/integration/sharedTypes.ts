import { z } from "zod";
export * from "./sharedTypes";

export const ZIntegrationBase = z.object({
  id: z.string(),
  environmentId: z.string(),
});

export const ZIntegrationBaseformData = z.object({
  createdAt: z.date(),
  questionIds: z.array(z.string()),
  questions: z.string(),
  formId: z.string(),
  formName: z.string(),
});
