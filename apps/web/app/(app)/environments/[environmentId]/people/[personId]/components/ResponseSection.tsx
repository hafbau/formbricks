import ResponseTimeline from "@/app/(app)/environments/[environmentId]/people/[personId]/components/ResponseTimeline";
import { authOptions } from "@fastform/lib/authOptions";
import { getResponsesByPersonId } from "@fastform/lib/response/service";
import { getSurveys } from "@fastform/lib/survey/service";
import { TEnvironment } from "@fastform/types/environment";
import { TSurvey } from "@fastform/types/surveys";
import { TTag } from "@fastform/types/tags";
import { getServerSession } from "next-auth";

export default async function ResponseSection({
  environment,
  personId,
  environmentTags,
}: {
  environment: TEnvironment;
  personId: string;
  environmentTags: TTag[];
}) {
  const responses = await getResponsesByPersonId(personId);
  const surveyIds = responses?.map((response) => response.surveyId) || [];
  const surveys: TSurvey[] = surveyIds.length === 0 ? [] : (await getSurveys(environment.id)) ?? [];
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("No session found");
  }

  return (
    <>
      {responses && (
        <ResponseTimeline
          profile={session.user}
          surveys={surveys}
          responses={responses}
          environment={environment}
          environmentTags={environmentTags}
        />
      )}
    </>
  );
}
