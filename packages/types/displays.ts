import { z } from "zod";

export const ZDisplay = z.object({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  personId: z.string().cuid().nullable(),
  formId: z.string().cuid(),
  responseId: z.string().cuid().nullable(),
  status: z.enum(["seen", "responded"]).optional(),
});

export type TDisplay = z.infer<typeof ZDisplay>;

export const ZDisplayCreateInput = z.object({
  environmentId: z.string().cuid(),
  formId: z.string().cuid(),
  userId: z.string().optional(),
  responseId: z.string().cuid().optional(),
});

export type TDisplayCreateInput = z.infer<typeof ZDisplayCreateInput>;

export const ZDisplayLegacyCreateInput = z.object({
  formId: z.string().cuid(),
  personId: z.string().cuid().optional(),
  responseId: z.string().cuid().optional(),
});

export type TDisplayLegacyCreateInput = z.infer<typeof ZDisplayLegacyCreateInput>;

export const ZDisplayUpdateInput = z.object({
  environmentId: z.string().cuid(),
  userId: z.string().optional(),
  responseId: z.string().cuid().optional(),
});

export type TDisplayUpdateInput = z.infer<typeof ZDisplayUpdateInput>;

export const ZDisplayLegacyUpdateInput = z.object({
  personId: z.string().cuid().optional(),
  responseId: z.string().cuid().optional(),
});

export type TDisplayLegacyUpdateInput = z.infer<typeof ZDisplayLegacyUpdateInput>;

export const ZDisplaysWithformName = ZDisplay.extend({
  formName: z.string(),
});

export type TDisplaysWithformName = z.infer<typeof ZDisplaysWithformName>;
