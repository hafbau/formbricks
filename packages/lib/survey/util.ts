import "server-only";

import { TSurveyDates } from "@fastform/types/surveys";

export const formatSurveyDateFields = (form: TSurveyDates): TSurveyDates => {
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
