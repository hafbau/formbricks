"use client";

import { TSurvey } from "@fastform/types/surveys";
import { Confetti } from "@fastform/ui/Confetti";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ShareEmbedSurvey from "./ShareEmbedSurvey";
import { TProduct } from "@fastform/types/product";
import { TEnvironment } from "@fastform/types/environment";
import { TProfile } from "@fastform/types/profile";

interface SummaryMetadataProps {
  environment: TEnvironment;
  form: TSurvey;
  webAppUrl: string;
  product: TProduct;
  profile: TProfile;
  singleUseIds?: string[];
}

export default function SuccessMessage({
  environment,
  form,
  webAppUrl,
  product,
  profile,
}: SummaryMetadataProps) {
  const searchParams = useSearchParams();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const newSurveyParam = searchParams?.get("success");
    if (newSurveyParam && form && environment) {
      setConfetti(true);
      toast.success(
        form.type === "web" && !environment.widgetSetupCompleted
          ? "Almost there! Install widget to start receiving responses."
          : "Congrats! Your form is live.",
        {
          icon: form.type === "web" && !environment.widgetSetupCompleted ? "🤏" : "🎉",
          duration: 5000,
          position: "bottom-right",
        }
      );
      if (form.type === "link") {
        setShowLinkModal(true);
      }
      // Remove success param from url
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
    }
  }, [environment, searchParams, form]);

  return (
    <>
      <ShareEmbedSurvey
        form={form}
        open={showLinkModal}
        setOpen={setShowLinkModal}
        webAppUrl={webAppUrl}
        product={product}
        profile={profile}
      />
      {confetti && <Confetti />}
    </>
  );
}
