import { TJsLegacyState, TJsState } from "@fastform/types/js";

export const transformLegacySurveys = (state: TJsState): TJsLegacyState => {
  const updatedState: any = { ...state };
  updatedState.surveys = updatedState.surveys.map((form) => {
    const updatedSurvey = { ...form };
    updatedSurvey.triggers = updatedSurvey.triggers.map((trigger) => ({ name: trigger }));
    return updatedSurvey;
  });
  return { ...updatedState, session: {} };
};
