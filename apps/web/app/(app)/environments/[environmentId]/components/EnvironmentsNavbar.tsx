export const revalidate = REVALIDATION_INTERVAL;

import Navigation from "@/app/(app)/environments/[environmentId]/components/Navigation";
import { IS_FORMBRICKS_CLOUD, REVALIDATION_INTERVAL, WEBAPP_URL } from "@fastform/lib/constants";
import { getEnvironment, getEnvironments } from "@fastform/lib/environment/service";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { getProducts } from "@fastform/lib/product/service";
import { getTeamByEnvironmentId, getTeamsByUserId } from "@fastform/lib/team/service";
import { ErrorComponent } from "@fastform/ui/ErrorComponent";
import type { Session } from "next-auth";

interface EnvironmentsNavbarProps {
  environmentId: string;
  session: Session;
  isFormbricksCloud: boolean;
}

export default async function EnvironmentsNavbar({ environmentId, session }: EnvironmentsNavbarProps) {
  const [environment, teams, team] = await Promise.all([
    getEnvironment(environmentId),
    getTeamsByUserId(session.user.id),
    getTeamByEnvironmentId(environmentId),
  ]);

  if (!team || !environment) {
    return <ErrorComponent />;
  }

  const [products, environments] = await Promise.all([
    getProducts(team.id),
    getEnvironments(environment.productId),
  ]);

  if (!products || !environments || !teams) {
    return <ErrorComponent />;
  }
  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);

  return (
    <Navigation
      environment={environment}
      team={team}
      teams={teams}
      products={products}
      environments={environments}
      session={session}
      isFormbricksCloud={IS_FORMBRICKS_CLOUD}
      webAppUrl={WEBAPP_URL}
      membershipRole={currentUserMembership?.role}
    />
  );
}
