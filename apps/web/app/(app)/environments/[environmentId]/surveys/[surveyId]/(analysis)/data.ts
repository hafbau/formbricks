import { getDisplayCountBySurveyId } from "@fastform/lib/display/service";
import { getResponses } from "@fastform/lib/response/service";
import { getSurvey } from "@fastform/lib/form/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";

export const getAnalysisData = async (surveyId: string, environmentId: string) => {
  const [form, team, responses, displayCount] = await Promise.all([
    getSurvey(surveyId),
    getTeamByEnvironmentId(environmentId),
    getResponses(surveyId),
    getDisplayCountBySurveyId(surveyId),
  ]);
  if (!form) throw new Error(`Form not found: ${surveyId}`);
  if (!team) throw new Error(`Team not found for environment: ${environmentId}`);
  if (form.environmentId !== environmentId) throw new Error(`Form not found: ${surveyId}`);
  const responseCount = responses.length;

  return { responses, responseCount, form, displayCount };
};
