import EditTagsWrapper from "./components/EditTagsWrapper";
import SettingsTitle from "../components/SettingsTitle";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getTagsByEnvironmentId } from "@fastform/lib/tag/service";
import { getTagsOnResponsesCount } from "@fastform/lib/tagOnResponse/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { authOptions } from "@fastform/lib/authOptions";
import { getServerSession } from "next-auth";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { ErrorComponent } from "@fastform/ui/ErrorComponent";
import { getAccessFlags } from "@fastform/lib/membership/utils";

export default async function MembersSettingsPage({ params }) {
  const environment = await getEnvironment(params.environmentId);
  if (!environment) {
    throw new Error("Environment not found");
  }
  const tags = await getTagsByEnvironmentId(params.environmentId);
  const environmentTagsCount = await getTagsOnResponsesCount(params.environmentId);
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
  const isTagSettingDisabled = isViewer;

  return !isTagSettingDisabled ? (
    <div>
      <SettingsTitle title="Tags" />
      <EditTagsWrapper
        environment={environment}
        environmentTags={tags}
        environmentTagsCount={environmentTagsCount}
      />
    </div>
  ) : (
    <ErrorComponent />
  );
}
