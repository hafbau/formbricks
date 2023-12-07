import { getProductByEnvironmentId } from "@fastform/lib/product/service";

import SettingsCard from "../components/SettingsCard";
import SettingsTitle from "../components/SettingsTitle";

import EditProductName from "./components/EditProductName";
import EditWaitingTime from "./components/EditWaitingTime";
import DeleteProduct from "./components/DeleteProduct";
import { getEnvironment } from "@fastform/lib/environment/service";
import { authOptions } from "@fastform/lib/authOptions";
import { getServerSession } from "next-auth";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { getAccessFlags } from "@fastform/lib/membership/utils";
import { ErrorComponent } from "@fastform/ui/ErrorComponent";

export default async function ProfileSettingsPage({ params }: { params: { environmentId: string } }) {
  const [, product, session, team] = await Promise.all([
    getEnvironment(params.environmentId),
    getProductByEnvironmentId(params.environmentId),
    getServerSession(authOptions),
    getTeamByEnvironmentId(params.environmentId),
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

  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);
  const { isDeveloper, isViewer } = getAccessFlags(currentUserMembership?.role);
  const isProductNameEditDisabled = isDeveloper ? true : isViewer;

  if (isViewer) {
    return <ErrorComponent />;
  }

  return (
    <div>
      <SettingsTitle title="Product Settings" />
      <SettingsCard title="Product Name" description="Change your products name.">
        <EditProductName
          environmentId={params.environmentId}
          product={product}
          isProductNameEditDisabled={isProductNameEditDisabled}
        />
      </SettingsCard>
      <SettingsCard
        title="Recontact Waiting Time"
        description="Control how frequently users can be formed across all forms.">
        <EditWaitingTime environmentId={params.environmentId} product={product} />
      </SettingsCard>
      <SettingsCard
        title="Delete Product"
        description="Delete product with all forms, responses, people, actions and attributes. This cannot be undone.">
        <DeleteProduct environmentId={params.environmentId} product={product} />
      </SettingsCard>
    </div>
  );
}
