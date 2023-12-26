export const revalidate = REVALIDATION_INTERVAL;
import { getActionClasses } from "@fastform/lib/actionClass/service";
import { getAttributeClasses } from "@fastform/lib/attributeClass/service";
import { authOptions } from "@fastform/lib/authOptions";
import { REVALIDATION_INTERVAL } from "@fastform/lib/constants";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { getAccessFlags } from "@fastform/lib/membership/utils";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { getResponseCountByformId } from "@fastform/lib/response/service";
import { getform } from "@fastform/lib/form/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { ErrorComponent } from "@fastform/ui/ErrorComponent";
import { getServerSession } from "next-auth";
import { colours } from "@fastform/lib/constants";
import FormEditor from "./components/FormEditor";

export const generateMetadata = async ({ params }) => {
  const form = await getform(params.formId);
  return {
    title: form?.name ? `${form?.name} | Editor` : "Editor",
  };
};

export default async function formsEditPage({ params }) {
  const [form, product, environment, actionClasses, attributeClasses, responseCount, team, session] =
    await Promise.all([
      getform(params.formId),
      getProductByEnvironmentId(params.environmentId),
      getEnvironment(params.environmentId),
      getActionClasses(params.environmentId),
      getAttributeClasses(params.environmentId),
      getResponseCountByformId(params.formId),
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
  const isformCreationDeletionDisabled = isViewer;

  if (
    !form ||
    !environment ||
    !actionClasses ||
    !attributeClasses ||
    !product ||
    isformCreationDeletionDisabled
  ) {
    return <ErrorComponent />;
  }

  return (
    <>
      <FormEditor
        form={form}
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
