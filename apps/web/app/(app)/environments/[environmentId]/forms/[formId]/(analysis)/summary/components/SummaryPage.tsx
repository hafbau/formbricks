"use client";

import { useResponseFilter } from "@/app/(app)/environments/[environmentId]/components/ResponseFilterContext";
import formResultsTabs from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/components/formResultsTabs";
import SummaryList from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/components/SummaryList";
import SummaryMetadata from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/components/SummaryMetadata";
import CustomFilter from "@/app/(app)/environments/[environmentId]/forms/[formId]/components/CustomFilter";
import SummaryHeader from "@/app/(app)/environments/[environmentId]/forms/[formId]/components/SummaryHeader";
import { getFilterResponses } from "@/app/lib/forms/forms";
import { useEffect, useMemo, useState } from "react";
import SummaryDropOffs from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/components/SummaryDropOffs";
import { TEnvironment } from "@fastform/types/environment";
import { TProduct } from "@fastform/types/product";
import { TProfile } from "@fastform/types/profile";
import { TResponse } from "@fastform/types/responses";
import { Tform } from "@fastform/types/forms";
import { TTag } from "@fastform/types/tags";
import ContentWrapper from "@fastform/ui/ContentWrapper";
import { useSearchParams } from "next/navigation";
import { TMembershipRole } from "@fastform/types/memberships";

interface SummaryPageProps {
  environment: TEnvironment;
  form: Tform;
  formId: string;
  responses: TResponse[];
  webAppUrl: string;
  product: TProduct;
  profile: TProfile;
  environmentTags: TTag[];
  displayCount: number;
  responsesPerPage: number;
  membershipRole?: TMembershipRole;
}

const SummaryPage = ({
  environment,
  form,
  formId,
  responses,
  webAppUrl,
  product,
  profile,
  environmentTags,
  displayCount,
  responsesPerPage,
  membershipRole,
}: SummaryPageProps) => {
  const { selectedFilter, dateRange, resetState } = useResponseFilter();
  const [showDropOffs, setShowDropOffs] = useState<boolean>(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams?.get("referer")) {
      resetState();
    }
  }, [searchParams]);

  // get the filtered array when the selected filter value changes
  const filterResponses: TResponse[] = useMemo(() => {
    return getFilterResponses(responses, selectedFilter, form, dateRange);
  }, [selectedFilter, responses, form, dateRange]);

  return (
    <ContentWrapper>
      <SummaryHeader
        environment={environment}
        form={form}
        formId={formId}
        webAppUrl={webAppUrl}
        product={product}
        profile={profile}
        membershipRole={membershipRole}
      />
      <CustomFilter
        environmentTags={environmentTags}
        responses={filterResponses}
        form={form}
        totalResponses={responses}
      />
      <formResultsTabs activeId="summary" environmentId={environment.id} formId={formId} />
      <SummaryMetadata
        responses={filterResponses}
        form={form}
        displayCount={displayCount}
        showDropOffs={showDropOffs}
        setShowDropOffs={setShowDropOffs}
      />
      {showDropOffs && <SummaryDropOffs form={form} responses={responses} displayCount={displayCount} />}
      <SummaryList
        responses={filterResponses}
        form={form}
        environment={environment}
        responsesPerPage={responsesPerPage}
      />
    </ContentWrapper>
  );
};

export default SummaryPage;
