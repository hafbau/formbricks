import { getAnalysisData } from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/(analysis)/data";
import { authOptions } from "@fastform/lib/authOptions";
import { getSurvey } from "@fastform/lib/form/service";
import { Metadata } from "next";
import { getServerSession } from "next-auth";

type Props = {
  params: { surveyId: string; environmentId: string };
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const session = await getServerSession(authOptions);
  const form = await getSurvey(params.surveyId);

  if (session) {
    const { responseCount } = await getAnalysisData(params.surveyId, params.environmentId);
    return {
      title: `${responseCount} Responses | ${form?.name} Results`,
    };
  }
  return {
    title: "",
  };
};

const SurveyLayout = ({ children }) => {
  return <div>{children}</div>;
};

export default SurveyLayout;
