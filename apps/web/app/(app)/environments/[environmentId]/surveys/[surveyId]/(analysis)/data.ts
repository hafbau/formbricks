import { getDisplayCountBySurveyId } from "@fastform/lib/display/service";
import { getResponses } from "@fastform/lib/response/service";
import { getSurvey } from "@fastform/lib/survey/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";

export const getAnalysisData = async (surveyId: string, environmentId: string) => {
  const [survey, team, responses, displayCount] = await Promise.all([
    getSurvey(surveyId),
    getTeamByEnvironmentId(environmentId),
    getResponses(surveyId),
    getDisplayCountBySurveyId(surveyId),
  ]);
  if (!survey) throw new Error(`Survey not found: ${surveyId}`);
  if (!team) throw new Error(`Team not found for environment: ${environmentId}`);
  if (survey.environmentId !== environmentId) throw new Error(`Survey not found: ${surveyId}`);
  const responseCount = responses.length;

  return { responses, responseCount, survey, displayCount };
};
