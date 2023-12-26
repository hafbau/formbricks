"use client";

import { env } from "@fastform/lib/env.mjs";
import { fastformEnabled } from "@/app/lib/fastform";
import fastform from "@fastform/js";
import { useEffect } from "react";

type UsageAttributesUpdaterProps = {
  numForms: number;
};

export default function FastformClient({ session }) {
  useEffect(() => {
    if (fastformEnabled && session?.user && fastform) {
      fastform.init({
        environmentId: env.NEXT_PUBLIC_FASTFORM_ENVIRONMENT_ID || "",
        apiHost: env.NEXT_PUBLIC_FASTFORM_API_HOST || "",
        userId: session.user.id,
      });
      fastform.setEmail(session.user.email);
    }
  }, [session]);
  return null;
}

const updateUsageAttributes = (numForms) => {
  if (!fastformEnabled) return;

  if (numForms >= 3) {
    fastform.setAttribute("HasThreeForms", "true");
  }
};

export function UsageAttributesUpdater({ numForms }: UsageAttributesUpdaterProps) {
  useEffect(() => {
    updateUsageAttributes(numForms);
  }, [numForms]);

  return null;
}
