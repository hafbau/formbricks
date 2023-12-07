import { getDisplayCountByformId } from "@fastform/lib/display/service";
import { getResponses } from "@fastform/lib/response/service";
import { getform } from "@fastform/lib/form/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";

export const getAnalysisData = async (formId: string, environmentId: string) => {
  const [form, team, responses, displayCount] = await Promise.all([
    getform(formId),
    getTeamByEnvironmentId(environmentId),
    getResponses(formId),
    getDisplayCountByformId(formId),
  ]);
  if (!form) throw new Error(`Form not found: ${formId}`);
  if (!team) throw new Error(`Team not found for environment: ${environmentId}`);
  if (form.environmentId !== environmentId) throw new Error(`Form not found: ${formId}`);
  const responseCount = responses.length;

  return { responses, responseCount, form, displayCount };
};
