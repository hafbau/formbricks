"use client";
import CustomFilter from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/components/CustomFilter";
import SummaryHeader from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/components/SummaryHeader";
import SurveyResultsTabs from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/(analysis)/components/SurveyResultsTabs";
import ResponseTimeline from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/(analysis)/responses/components/ResponseTimeline";
import ContentWrapper from "@fastform/ui/ContentWrapper";
import { useResponseFilter } from "@/app/(app)/environments/[environmentId]/components/ResponseFilterContext";
import { getFilterResponses } from "@/app/lib/surveys/surveys";
import { TResponse } from "@fastform/types/responses";
import { TSurvey } from "@fastform/types/surveys";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { TEnvironment } from "@fastform/types/environment";
import { TProduct } from "@fastform/types/product";
import { TTag } from "@fastform/types/tags";
import { TProfile } from "@fastform/types/profile";
import { TMembershipRole } from "@fastform/types/memberships";

interface ResponsePageProps {
  environment: TEnvironment;
  survey: TSurvey;
  surveyId: string;
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
  survey,
  surveyId,
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
    return getFilterResponses(responses, selectedFilter, survey, dateRange);
  }, [selectedFilter, responses, survey, dateRange]);
  return (
    <ContentWrapper>
      <SummaryHeader
        environment={environment}
        survey={survey}
        surveyId={surveyId}
        webAppUrl={webAppUrl}
        product={product}
        profile={profile}
        membershipRole={membershipRole}
      />
      <CustomFilter
        environmentTags={environmentTags}
        responses={filterResponses}
        survey={survey}
        totalResponses={responses}
      />
      <SurveyResultsTabs activeId="responses" environmentId={environment.id} surveyId={surveyId} />
      <ResponseTimeline
        environment={environment}
        surveyId={surveyId}
        responses={filterResponses}
        survey={survey}
        profile={profile}
        environmentTags={environmentTags}
        responsesPerPage={responsesPerPage}
      />
    </ContentWrapper>
  );
};

export default ResponsePage;
