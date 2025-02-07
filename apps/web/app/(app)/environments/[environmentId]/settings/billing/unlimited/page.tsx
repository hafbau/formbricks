import { authOptions } from "@fastform/lib/authOptions";
import { IS_FASTFORM_CLOUD } from "@fastform/lib/constants";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { upgradePlanAction } from "../actions";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { StripePriceLookupKeys } from "@fastform/ee/billing/lib/constants";

export default async function UnlimitedPage({ params }) {
  if (!IS_FASTFORM_CLOUD) {
    notFound();
  }

  const session = await getServerSession(authOptions);

  const team = await getTeamByEnvironmentId(params.environmentId);

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!team) {
    throw new Error("Team not found");
  }

  const { status, newPlan, url } = await upgradePlanAction(team.id, params.environmentId, [
    StripePriceLookupKeys.inAppFormUnlimited,
    StripePriceLookupKeys.linkFormUnlimited,
    StripePriceLookupKeys.userTargetingUnlimited,
  ]);
  if (status != 200) {
    throw new Error("Something went wrong");
  }
  if (newPlan && url) {
    redirect(url);
  } else if (!newPlan) {
    redirect(`/billing-confirmation?environmentId=${params.environmentId}`);
  } else {
    throw new Error("Something went wrong");
  }
}
