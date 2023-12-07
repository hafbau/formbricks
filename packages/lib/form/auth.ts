import { ZId } from "@fastform/types/environment";
import { validateInputs } from "../utils/validate";
import { hasUserEnvironmentAccess } from "../environment/auth";
import { getform } from "./service";
import { formCache } from "./cache";
import { unstable_cache } from "next/cache";
import { SERVICES_REVALIDATION_INTERVAL } from "../constants";
import { getMembershipByUserIdTeamId } from "../../lib/membership/service";
import { getAccessFlags } from "../../lib/membership/utils";
import { getTeamByEnvironmentId } from "../../lib/team/service";

export const canUserAccessform = async (userId: string, formId: string): Promise<boolean> =>
  await unstable_cache(
    async () => {
      validateInputs([formId, ZId], [userId, ZId]);

      if (!userId) return false;

      const form = await getform(formId);
      if (!form) throw new Error("Form not found");

      const hasAccessToEnvironment = await hasUserEnvironmentAccess(userId, form.environmentId);
      if (!hasAccessToEnvironment) return false;

      return true;
    },
    [`canUserAccessform-${userId}-${formId}`],
    { revalidate: SERVICES_REVALIDATION_INTERVAL, tags: [formCache.tag.byId(formId)] }
  )();

export const verifyUserRoleAccess = async (
  environmentId: string,
  userId: string
): Promise<{
  hasCreateOrUpdateAccess: boolean;
  hasDeleteAccess: boolean;
}> => {
  const accessObject = {
    hasCreateOrUpdateAccess: true,
    hasDeleteAccess: true,
  };

  const team = await getTeamByEnvironmentId(environmentId);
  if (!team) {
    throw new Error("Team not found");
  }

  const currentUserMembership = await getMembershipByUserIdTeamId(userId, team.id);
  const { isViewer } = getAccessFlags(currentUserMembership?.role);

  if (isViewer) {
    accessObject.hasCreateOrUpdateAccess = false;
    accessObject.hasDeleteAccess = false;
  }

  return accessObject;
};
