export const revalidate = REVALIDATION_INTERVAL;
import { getActionClasses } from "@fastform/lib/actionClass/service";
import { getAttributeClasses } from "@fastform/lib/attributeClass/service";
import { authOptions } from "@fastform/lib/authOptions";
import { REVALIDATION_INTERVAL } from "@fastform/lib/constants";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { getAccessFlags } from "@fastform/lib/membership/utils";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { getResponseCountBySurveyId } from "@fastform/lib/response/service";
import { getSurvey } from "@fastform/lib/survey/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { ErrorComponent } from "@fastform/ui/ErrorComponent";
import { getServerSession } from "next-auth";
import { colours } from "@fastform/lib/constants";
import SurveyEditor from "./components/SurveyEditor";

export const generateMetadata = async ({ params }) => {
  const survey = await getSurvey(params.surveyId);
  return {
    title: survey?.name ? `${survey?.name} | Editor` : "Editor",
  };
};

export default async function SurveysEditPage({ params }) {
  const [survey, product, environment, actionClasses, attributeClasses, responseCount, team, session] =
    await Promise.all([
      getSurvey(params.surveyId),
      getProductByEnvironmentId(params.environmentId),
      getEnvironment(params.environmentId),
      getActionClasses(params.environmentId),
      getAttributeClasses(params.environmentId),
      getResponseCountBySurveyId(params.surveyId),
      getTeamByEnvironmentId(params.environmentId),
      getServerSession(authOptions),
    ]);

  if (!session) {
    throw new Error("Session not found");
  }

  if (!team) {
    throw new Error("Team not found");
  }

  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);
  const { isViewer } = getAccessFlags(currentUserMembership?.role);
  const isSurveyCreationDeletionDisabled = isViewer;

  if (
    !survey ||
    !environment ||
    !actionClasses ||
    !attributeClasses ||
    !product ||
    isSurveyCreationDeletionDisabled
  ) {
    return <ErrorComponent />;
  }

  return (
    <>
      <SurveyEditor
        survey={survey}
        product={product}
        environment={environment}
        actionClasses={actionClasses}
        attributeClasses={attributeClasses}
        responseCount={responseCount}
        membershipRole={currentUserMembership?.role}
        colours={colours}
      />
    </>
  );
}
