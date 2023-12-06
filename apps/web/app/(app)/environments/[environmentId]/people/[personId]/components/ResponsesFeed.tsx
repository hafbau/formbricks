import EmptySpaceFiller from "@fastform/ui/EmptySpaceFiller";
import { TEnvironment } from "@fastform/types/environment";
import { TProfile } from "@fastform/types/profile";
import { TResponse } from "@fastform/types/responses";
import { TSurvey } from "@fastform/types/surveys";
import { TTag } from "@fastform/types/tags";
import SingleResponseCard from "@fastform/ui/SingleResponseCard";

export default async function ResponseFeed({
  responses,
  environment,
  surveys,
  profile,
  environmentTags,
}: {
  responses: TResponse[];
  environment: TEnvironment;
  surveys: TSurvey[];
  profile: TProfile;
  environmentTags: TTag[];
}) {
  return (
    <>
      {responses.length === 0 ? (
        <EmptySpaceFiller type="response" environment={environment} />
      ) : (
        responses.map((response, idx) => {
          const form = surveys.find((form) => {
            return form.id === response.surveyId;
          });
          return (
            <div key={idx}>
              {form && (
                <SingleResponseCard
                  response={response}
                  form={form}
                  profile={profile}
                  pageType="people"
                  environmentTags={environmentTags}
                  environment={environment}
                />
              )}
            </div>
          );
        })
      )}
    </>
  );
}
