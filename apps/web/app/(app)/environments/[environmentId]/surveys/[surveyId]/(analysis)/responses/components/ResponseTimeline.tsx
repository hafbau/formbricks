"use client";
import React, { useState, useEffect, useRef } from "react";
import EmptyInAppSurveys from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/(analysis)/components/EmptyInAppSurveys";
import EmptySpaceFiller from "@fastform/ui/EmptySpaceFiller";
import { TEnvironment } from "@fastform/types/environment";
import { TProfile } from "@fastform/types/profile";
import { TResponse } from "@fastform/types/responses";
import { TSurvey } from "@fastform/types/surveys";
import { TTag } from "@fastform/types/tags";
import SingleResponseCard from "@fastform/ui/SingleResponseCard";

interface ResponseTimelineProps {
  environment: TEnvironment;
  surveyId: string;
  responses: TResponse[];
  survey: TSurvey;
  profile: TProfile;
  environmentTags: TTag[];
  responsesPerPage: number;
}

export default function ResponseTimeline({
  environment,
  responses,
  survey,
  profile,
  environmentTags,
  responsesPerPage,
}: ResponseTimelineProps) {
  const [displayedResponses, setDisplayedResponses] = useState<TResponse[]>([]);
  const loadingRef = useRef(null);

  useEffect(() => {
    setDisplayedResponses(responses.slice(0, responsesPerPage));
  }, [responses]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedResponses((prevResponses) => [
            ...prevResponses,
            ...responses.slice(prevResponses.length, prevResponses.length + responsesPerPage),
          ]);
        }
      },
      { threshold: 0.8 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [responses]);

  return (
    <div className="space-y-4">
      {survey.type === "web" && displayedResponses.length === 0 && !environment.widgetSetupCompleted ? (
        <EmptyInAppSurveys environment={environment} />
      ) : displayedResponses.length === 0 ? (
        <EmptySpaceFiller
          type="response"
          environment={environment}
          noWidgetRequired={survey.type === "link"}
        />
      ) : (
        <div>
          {displayedResponses.map((response) => {
            return (
              <div key={response.id}>
                <SingleResponseCard
                  survey={survey}
                  response={response}
                  profile={profile}
                  environmentTags={environmentTags}
                  pageType="response"
                  environment={environment}
                />
              </div>
            );
          })}
          <div ref={loadingRef}></div>
        </div>
      )}
    </div>
  );
}
