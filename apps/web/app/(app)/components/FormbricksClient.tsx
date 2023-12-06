"use client";

import { env } from "@fastform/lib/env.mjs";
import { formbricksEnabled } from "@/app/lib/fastform";
import fastform from "@fastform/js";
import { useEffect } from "react";

type UsageAttributesUpdaterProps = {
  numSurveys: number;
};

export default function FormbricksClient({ session }) {
  useEffect(() => {
    if (formbricksEnabled && session?.user && fastform) {
      fastform.init({
        environmentId: env.NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID || "",
        apiHost: env.NEXT_PUBLIC_FORMBRICKS_API_HOST || "",
        userId: session.user.id,
      });
      fastform.setEmail(session.user.email);
    }
  }, [session]);
  return null;
}

const updateUsageAttributes = (numSurveys) => {
  if (!formbricksEnabled) return;

  if (numSurveys >= 3) {
    fastform.setAttribute("HasThreeSurveys", "true");
  }
};

export function UsageAttributesUpdater({ numSurveys }: UsageAttributesUpdaterProps) {
  useEffect(() => {
    updateUsageAttributes(numSurveys);
  }, [numSurveys]);

  return null;
}
