import "server-only";

import { ZId } from "@fastform/types/environment";
import { unstable_cache } from "next/cache";
import { SERVICES_REVALIDATION_INTERVAL } from "../constants";
import { hasUserEnvironmentAccess } from "../environment/auth";
import { getform } from "../form/service";
import { validateInputs } from "../utils/validate";
import { getResponse } from "./service";
import { responseCache } from "./cache";

export const canUserAccessResponse = async (userId: string, responseId: string): Promise<boolean> =>
  await unstable_cache(
    async () => {
      validateInputs([userId, ZId], [responseId, ZId]);

      if (!userId) return false;

      const response = await getResponse(responseId);
      if (!response) return false;

      const form = await getform(response.formId);
      if (!form) return false;

      const hasAccessToEnvironment = await hasUserEnvironmentAccess(userId, form.environmentId);
      if (!hasAccessToEnvironment) return false;

      return true;
    },
    [`canUserAccessResponse-${userId}-${responseId}`],
    { revalidate: SERVICES_REVALIDATION_INTERVAL, tags: [responseCache.tag.byId(responseId)] }
  )();
