export const revalidate = REVALIDATION_INTERVAL;

import { REVALIDATION_INTERVAL } from "@fastform/lib/constants";
import SettingsCard from "../components/SettingsCard";
import SettingsTitle from "../components/SettingsTitle";
import ApiKeyList from "./components/ApiKeyList";
import EnvironmentNotice from "@fastform/ui/EnvironmentNotice";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { authOptions } from "@fastform/lib/authOptions";
import { getServerSession } from "next-auth";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { ErrorComponent } from "@fastform/ui/ErrorComponent";
import { getAccessFlags } from "@fastform/lib/membership/utils";

export default async function ProfileSettingsPage({ params }) {
  const environment = await getEnvironment(params.environmentId);
  const team = await getTeamByEnvironmentId(params.environmentId);
  const session = await getServerSession(authOptions);

  if (!environment) {
    throw new Error("Environment not found");
  }
  if (!team) {
    throw new Error("Team not found");
  }
  if (!session) {
    throw new Error("Unauthenticated");
  }

  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);
  const { isViewer } = getAccessFlags(currentUserMembership?.role);

  return !isViewer ? (
    <div>
      <SettingsTitle title="API Keys" />
      <EnvironmentNotice environmentId={environment.id} subPageUrl="/settings/api-keys" />
      {environment.type === "development" ? (
        <SettingsCard
          title="Development Env Keys"
          description="Add and remove API keys for your Development environment.">
          <ApiKeyList environmentId={params.environmentId} environmentType="development" />
        </SettingsCard>
      ) : (
        <SettingsCard
          title="Production Env Keys"
          description="Add and remove API keys for your Production environment.">
          <ApiKeyList environmentId={params.environmentId} environmentType="production" />
        </SettingsCard>
      )}
    </div>
  ) : (
    <ErrorComponent />
  );
}
