import { z } from "zod";
import { ZEnvironment } from "./environment";
import { ZColor, ZPlacement } from "./common";

export const ZProduct = z.object({
  id: z.string().cuid2(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  teamId: z.string(),
  brandColor: ZColor,
  highlightBorderColor: ZColor.nullable(),
  recontactDays: z.number().int(),
  inAppFormBranding: z.boolean(),
  linkFormBranding: z.boolean(),
  placement: ZPlacement,
  clickOutsideClose: z.boolean(),
  darkOverlay: z.boolean(),
  environments: z.array(ZEnvironment),
});

export type TProduct = z.infer<typeof ZProduct>;

export const ZProductUpdateInput = ZProduct.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TProductUpdateInput = z.infer<typeof ZProductUpdateInput>;
