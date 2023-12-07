"use client";

import { env } from "@fastform/lib/env.mjs";
import { fastformEnabled } from "@/app/lib/fastform";
import fastform from "@fastform/js";
import { useEffect } from "react";

type UsageAttributesUpdaterProps = {
  numSurveys: number;
};

export default function fastformClient({ session }) {
  useEffect(() => {
    if (fastformEnabled && session?.user && fastform) {
      fastform.init({
        environmentId: env.NEXT_PUBLIC_fastform_ENVIRONMENT_ID || "",
        apiHost: env.NEXT_PUBLIC_fastform_API_HOST || "",
        userId: session.user.id,
      });
      fastform.setEmail(session.user.email);
    }
  }, [session]);
  return null;
}

const updateUsageAttributes = (numSurveys) => {
  if (!fastformEnabled) return;

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
