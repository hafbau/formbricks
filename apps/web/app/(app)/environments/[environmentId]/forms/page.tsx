export const revalidate = REVALIDATION_INTERVAL;

import ContentWrapper from "@fastform/ui/ContentWrapper";
import { REVALIDATION_INTERVAL } from "@fastform/lib/constants";
import { Metadata } from "next";
import FormsList from "./components/FormList";
import WidgetStatusIndicator from "@/app/(app)/environments/[environmentId]/components/WidgetStatusIndicator";

export const metadata: Metadata = {
  title: "Your Forms",
};

export default async function FormsPage({ params }) {
  return (
    <ContentWrapper className="flex h-full flex-col justify-between">
      <FormsList environmentId={params.environmentId} />
      <WidgetStatusIndicator environmentId={params.environmentId} type="mini" />
    </ContentWrapper>
  );
}
