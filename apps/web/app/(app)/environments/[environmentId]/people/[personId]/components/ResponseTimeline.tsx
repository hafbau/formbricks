"use client";

import ResponseFeed from "@/app/(app)/environments/[environmentId]/people/[personId]/components/ResponsesFeed";
import { TResponse } from "@fastform/types/responses";
import { TForm } from "@fastform/types/forms";
import { TEnvironment } from "@fastform/types/environment";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { TTag } from "@fastform/types/tags";
import { TProfile } from "@fastform/types/profile";

export default function ResponseTimeline({
  forms,
  profile,
  environment,
  responses,
  environmentTags,
}: {
  forms: TForm[];
  profile: TProfile;
  responses: TResponse[];
  environment: TEnvironment;
  environmentTags: TTag[];
}) {
  const [responsesAscending, setResponsesAscending] = useState(false);
  const [sortedResponses, setSortedResponses] = useState(responses);
  const toggleSortResponses = () => {
    setResponsesAscending(!responsesAscending);
  };

  useEffect(() => {
    setSortedResponses(responsesAscending ? [...responses].reverse() : responses);
  }, [responsesAscending]);

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between pb-6">
        <h2 className="text-lg font-bold text-slate-700">Responses</h2>
        <div className="text-right">
          <button
            onClick={toggleSortResponses}
            className="hover:text-brand-dark flex items-center px-1 text-slate-800">
            <ArrowsUpDownIcon className="inline h-4 w-4" />
          </button>
        </div>
      </div>
      <ResponseFeed
        responses={sortedResponses}
        environment={environment}
        forms={forms}
        profile={profile}
        environmentTags={environmentTags}
      />
    </div>
  );
}
