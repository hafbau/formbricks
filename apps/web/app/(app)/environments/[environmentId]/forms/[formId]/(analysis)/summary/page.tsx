export const revalidate = REVALIDATION_INTERVAL;

import { getAnalysisData } from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/data";
import SummaryPage from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/components/SummaryPage";
import { authOptions } from "@fastform/lib/authOptions";
import { REVALIDATION_INTERVAL, TEXT_RESPONSES_PER_PAGE, WEBAPP_URL } from "@fastform/lib/constants";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { getProfile } from "@fastform/lib/profile/service";
import { getTagsByEnvironmentId } from "@fastform/lib/tag/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { getServerSession } from "next-auth";

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const [{ responses, form, displayCount }, environment] = await Promise.all([
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

  const team = await getTeamByEnvironmentId(params.environmentId);

  if (!team) {
    throw new Error("Team not found");
  }

  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);

  const tags = await getTagsByEnvironmentId(params.environmentId);

  return (
    <>
      <SummaryPage
        environment={environment}
        responses={responses}
        form={form}
        formId={params.formId}
        webAppUrl={WEBAPP_URL}
        product={product}
        profile={profile}
        environmentTags={tags}
        displayCount={displayCount}
        responsesPerPage={TEXT_RESPONSES_PER_PAGE}
        membershipRole={currentUserMembership?.role}
      />
    </>
  );
}
