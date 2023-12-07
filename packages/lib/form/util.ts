import "server-only";

import { TformDates } from "@fastform/types/forms";

export const formatformDateFields = (form: TformDates): TformDates => {
  if (typeof form.createdAt === "string") {
    form.createdAt = new Date(form.createdAt);
  }
  if (typeof form.updatedAt === "string") {
    form.updatedAt = new Date(form.updatedAt);
  }
  if (typeof form.closeOnDate === "string") {
    form.closeOnDate = new Date(form.closeOnDate);
  }

  return form;
};
