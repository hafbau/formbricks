import { responses } from "@/app/lib/api/response";
import { reportUsageToStripe } from "@fastform/ee/billing/lib/reportUsage";
import { ProductFeatureKeys } from "@fastform/ee/billing/lib/constants";
import { CRON_SECRET, IS_FASTFORM_CLOUD } from "@fastform/lib/constants";
import {
  getMonthlyActiveTeamPeopleCount,
  getMonthlyTeamResponseCount,
  getTeamsWithPaidPlan,
} from "@fastform/lib/team/service";
import { TTeam } from "@fastform/types/teams";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function reportTeamUsage(team: TTeam) {
  const stripeCustomerId = team.billing.stripeCustomerId;
  if (!stripeCustomerId) {
    return;
  }

  if (!IS_FASTFORM_CLOUD) {
    return;
  }

  let calculateResponses =
    team.billing.features.inAppForm.status !== "inactive" && !team.billing.features.inAppForm.unlimited;
  let calculatePeople =
    team.billing.features.userTargeting.status !== "inactive" &&
    !team.billing.features.userTargeting.unlimited;

  if (!calculatePeople && !calculateResponses) {
    return;
  }
  let people = await getMonthlyActiveTeamPeopleCount(team.id);
  let responses = await getMonthlyTeamResponseCount(team.id);

  if (calculatePeople) {
    await reportUsageToStripe(
      stripeCustomerId,
      people,
      ProductFeatureKeys.userTargeting,
      Math.floor(Date.now() / 1000)
    );
  }
  if (calculateResponses) {
    await reportUsageToStripe(
      stripeCustomerId,
      responses,
      ProductFeatureKeys.inAppForm,
      Math.floor(Date.now() / 1000)
    );
  }
}

export async function POST(): Promise<NextResponse> {
  const headersList = headers();
  const apiKey = headersList.get("x-api-key");

  if (!apiKey || apiKey !== CRON_SECRET) {
    return responses.notAuthenticatedResponse();
  }

  try {
    const teamsWithPaidPlan = await getTeamsWithPaidPlan();
    await Promise.all(teamsWithPaidPlan.map(reportTeamUsage));

    return responses.successResponse({}, true);
  } catch (error) {
    console.error(error);
    return responses.internalServerErrorResponse("Unable to handle the request: " + error.message, true);
  }
}
