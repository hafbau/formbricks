export const revalidate = REVALIDATION_INTERVAL;

import ContentWrapper from "@fastform/ui/ContentWrapper";
import { REVALIDATION_INTERVAL } from "@fastform/lib/constants";
import { Metadata } from "next";
import SurveysList from "./components/SurveyList";
import WidgetStatusIndicator from "@/app/(app)/environments/[environmentId]/components/WidgetStatusIndicator";

export const metadata: Metadata = {
  title: "Your Surveys",
};

export default async function SurveysPage({ params }) {
  return (
    <ContentWrapper className="flex h-full flex-col justify-between">
      <SurveysList environmentId={params.environmentId} />
      <WidgetStatusIndicator environmentId={params.environmentId} type="mini" />
    </ContentWrapper>
  );
}
