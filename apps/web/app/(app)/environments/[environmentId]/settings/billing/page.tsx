export const revalidate = REVALIDATION_INTERVAL;

import {
  IS_FASTFORM_CLOUD,
  PRICING_APPFORMS_FREE_RESPONSES,
  REVALIDATION_INTERVAL,
} from "@fastform/lib/constants";

import { authOptions } from "@fastform/lib/authOptions";
import {
  getMonthlyActiveTeamPeopleCount,
  getMonthlyTeamResponseCount,
  getTeamByEnvironmentId,
} from "@fastform/lib/team/service";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import SettingsTitle from "../components/SettingsTitle";
import PricingTable from "./components/PricingTable";
import { PRICING_USERTARGETING_FREE_MTU } from "@fastform/lib/constants";
import { ErrorComponent } from "@fastform/ui/ErrorComponent";
import { getAccessFlags } from "@fastform/lib/membership/utils";

export default async function ProfileSettingsPage({ params }) {
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

  const [peopleCount, responseCount] = await Promise.all([
    getMonthlyActiveTeamPeopleCount(team.id),
    getMonthlyTeamResponseCount(team.id),
  ]);
  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);
  const { isAdmin, isOwner } = getAccessFlags(currentUserMembership?.role);
  const isPricingDisabled = !isOwner && !isAdmin;

  return (
    <>
      <div>
        <SettingsTitle title="Billing & Plan" />
        {!isPricingDisabled ? (
          <PricingTable
            team={team}
            environmentId={params.environmentId}
            peopleCount={peopleCount}
            responseCount={responseCount}
            userTargetingFreeMtu={PRICING_USERTARGETING_FREE_MTU}
            inAppFormFreeResponses={PRICING_APPFORMS_FREE_RESPONSES}
          />
        ) : (
          <ErrorComponent />
        )}
      </div>
    </>
  );
}
