import { Metadata } from "next";
import SettingsNavbar from "./components/SettingsNavbar";
import { IS_FASTFORM_CLOUD } from "@fastform/lib/constants";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { authOptions } from "@fastform/lib/authOptions";
import { getServerSession } from "next-auth";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsLayout({ children, params }) {
  const [team, product, session] = await Promise.all([
    getTeamByEnvironmentId(params.environmentId),
    getProductByEnvironmentId(params.environmentId),
    getServerSession(authOptions),
  ]);
  if (!team) {
    throw new Error("Team not found");
  }
  if (!product) {
    throw new Error("Product not found");
  }

  if (!session) {
    throw new Error("Unauthenticated");
  }

  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);

  return (
    <>
      <div className="sm:flex">
        <SettingsNavbar
          environmentId={params.environmentId}
          isFastformCloud={IS_FASTFORM_CLOUD}
          team={team}
          product={product}
          membershipRole={currentUserMembership?.role}
        />
        <div className="w-full md:ml-64">
          <div className="max-w-4xl px-20 pb-6 pt-14 md:pt-6">
            <div>{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
