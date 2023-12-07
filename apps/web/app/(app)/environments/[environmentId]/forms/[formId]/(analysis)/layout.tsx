import { getAnalysisData } from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/data";
import { authOptions } from "@fastform/lib/authOptions";
import { getform } from "@fastform/lib/form/service";
import { Metadata } from "next";
import { getServerSession } from "next-auth";

type Props = {
  params: { formId: string; environmentId: string };
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const session = await getServerSession(authOptions);
  const form = await getform(params.formId);

  if (session) {
    const { responseCount } = await getAnalysisData(params.formId, params.environmentId);
    return {
      title: `${responseCount} Responses | ${form?.name} Results`,
    };
  }
  return {
    title: "",
  };
};

const formLayout = ({ children }) => {
  return <div>{children}</div>;
};

export default formLayout;
