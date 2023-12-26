export const revalidate = REVALIDATION_INTERVAL;

import { getIsEnterpriseEdition } from "@fastform/ee/lib/service";
import { authOptions } from "@fastform/lib/authOptions";
import { DEFAULT_BRAND_COLOR, IS_FASTFORM_CLOUD, REVALIDATION_INTERVAL } from "@fastform/lib/constants";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { getAccessFlags } from "@fastform/lib/membership/utils";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { ErrorComponent } from "@fastform/ui/ErrorComponent";
import { getServerSession } from "next-auth";
import SettingsCard from "../components/SettingsCard";
import SettingsTitle from "../components/SettingsTitle";
import { EditBrandColor } from "./components/EditBrandColor";
import { EditFastformBranding } from "./components/EditBranding";
import { EditHighlightBorder } from "./components/EditHighlightBorder";
import { EditPlacement } from "./components/EditPlacement";

export default async function ProfileSettingsPage({ params }: { params: { environmentId: string } }) {
  const [session, team, product] = await Promise.all([
    getServerSession(authOptions),
    getTeamByEnvironmentId(params.environmentId),
    getProductByEnvironmentId(params.environmentId),
  ]);

  if (!product) {
    throw new Error("Product not found");
  }
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (!team) {
    throw new Error("Team not found");
  }

  const isEnterpriseEdition = await getIsEnterpriseEdition();

  const canRemoveLinkBranding =
    team.billing.features.linkForm.status !== "inactive" || !IS_FASTFORM_CLOUD;
  const canRemoveInAppBranding =
    team.billing.features.inAppform.status !== "inactive" || isEnterpriseEdition;

  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);
  const { isDeveloper, isViewer } = getAccessFlags(currentUserMembership?.role);
  const isBrandColorEditDisabled = isDeveloper ? true : isViewer;

  if (isViewer) {
    return <ErrorComponent />;
  }

  return (
    <div>
      <SettingsTitle title="Look & Feel" />
      <SettingsCard title="Brand Color" description="Match the forms with your user interface.">
        <EditBrandColor
          product={product}
          isBrandColorDisabled={isBrandColorEditDisabled}
          environmentId={params.environmentId}
        />
      </SettingsCard>
      <SettingsCard
        title="In-app Form Placement"
        description="Change where forms will be shown in your web app.">
        <EditPlacement product={product} environmentId={params.environmentId} />
      </SettingsCard>
      <SettingsCard
        noPadding
        title="Highlight Border"
        description="Make sure your users notice the form you display">
        <EditHighlightBorder
          product={product}
          defaultBrandColor={DEFAULT_BRAND_COLOR}
          environmentId={params.environmentId}
        />
      </SettingsCard>
      <SettingsCard
        title="Fastform Branding"
        description="We love your support but understand if you toggle it off.">
        <EditFastformBranding
          type="linkForm"
          product={product}
          canRemoveBranding={canRemoveLinkBranding}
          environmentId={params.environmentId}
        />
        <EditFastformBranding
          type="inAppform"
          product={product}
          canRemoveBranding={canRemoveInAppBranding}
          environmentId={params.environmentId}
          isFastformCloud={IS_FASTFORM_CLOUD}
        />
      </SettingsCard>
    </div>
  );
}
