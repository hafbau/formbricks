export const revalidate = REVALIDATION_INTERVAL;

import { getAnalysisData } from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/data";
import ResponsePage from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/responses/components/ResponsePage";
import { authOptions } from "@fastform/lib/authOptions";
import { RESPONSES_PER_PAGE, REVALIDATION_INTERVAL, WEBAPP_URL } from "@fastform/lib/constants";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { getProfile } from "@fastform/lib/profile/service";
import { getTagsByEnvironmentId } from "@fastform/lib/tag/service";
import { getServerSession } from "next-auth";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }
  const [{ responses, form }, environment] = await Promise.all([
    getAnalysisData(params.formId, params.environmentId),
    getEnvironment(params.environmentId),
  ]);
  if (!environment) {
    throw new Error("Environment not found");
  }
  const product = await getProductByEnvironmentId(environment.id);
  if (!product) {
    throw new Error("Product not found");
  }

  const profile = await getProfile(session.user.id);
  if (!profile) {
    throw new Error("Profile not found");
  }
  const tags = await getTagsByEnvironmentId(params.environmentId);
  const team = await getTeamByEnvironmentId(params.environmentId);
  if (!team) {
    throw new Error("Team not found");
  }

  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);

  return (
    <>
      <ResponsePage
        environment={environment}
        responses={responses}
        form={form}
        formId={params.formId}
        webAppUrl={WEBAPP_URL}
        product={product}
        environmentTags={tags}
        profile={profile}
        responsesPerPage={RESPONSES_PER_PAGE}
        membershipRole={currentUserMembership?.role}
      />
    </>
  );
}
