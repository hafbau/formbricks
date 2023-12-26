"use client";
import CustomFilter from "@/app/(app)/environments/[environmentId]/forms/[formId]/components/CustomFilter";
import SummaryHeader from "@/app/(app)/environments/[environmentId]/forms/[formId]/components/SummaryHeader";
import FormResultsTabs from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/components/FormResultsTabs";
import ResponseTimeline from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/responses/components/ResponseTimeline";
import ContentWrapper from "@fastform/ui/ContentWrapper";
import { useResponseFilter } from "@/app/(app)/environments/[environmentId]/components/ResponseFilterContext";
import { getFilterResponses } from "@/app/lib/forms/forms";
import { TResponse } from "@fastform/types/responses";
import { TForm } from "@fastform/types/forms";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { TEnvironment } from "@fastform/types/environment";
import { TProduct } from "@fastform/types/product";
import { TTag } from "@fastform/types/tags";
import { TProfile } from "@fastform/types/profile";
import { TMembershipRole } from "@fastform/types/memberships";

interface ResponsePageProps {
  environment: TEnvironment;
  form: TForm;
  formId: string;
  responses: TResponse[];
  webAppUrl: string;
  product: TProduct;
  profile: TProfile;
  environmentTags: TTag[];
  responsesPerPage: number;
  membershipRole?: TMembershipRole;
}

const ResponsePage = ({
  environment,
  form,
  formId,
  responses,
  webAppUrl,
  product,
  profile,
  environmentTags,
  responsesPerPage,
  membershipRole,
}: ResponsePageProps) => {
  const { selectedFilter, dateRange, resetState } = useResponseFilter();

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
      <FormResultsTabs activeId="responses" environmentId={environment.id} formId={formId} />
      <ResponseTimeline
        environment={environment}
        formId={formId}
        responses={filterResponses}
        form={form}
        profile={profile}
        environmentTags={environmentTags}
        responsesPerPage={responsesPerPage}
      />
    </ContentWrapper>
  );
};

export default ResponsePage;
