import EmptyInAppforms from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/components/EmptyInAppforms";
import ConsentSummary from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/components/ConsentSummary";
import HiddenFieldsSummary from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/components/HiddenFieldsSummary";
import EmptySpaceFiller from "@fastform/ui/EmptySpaceFiller";
import { TformQuestionType } from "@fastform/types/forms";
import type {
  TformFileUploadQuestion,
  TformPictureSelectionQuestion,
  TformQuestionSummary,
} from "@fastform/types/forms";
import { TEnvironment } from "@fastform/types/environment";
import { TResponse } from "@fastform/types/responses";
import {
  Tform,
  TformCTAQuestion,
  TformConsentQuestion,
  TformMultipleChoiceMultiQuestion,
  TformMultipleChoiceSingleQuestion,
  TformNPSQuestion,
  TformOpenTextQuestion,
  TformQuestion,
  TformRatingQuestion,
} from "@fastform/types/forms";
import CTASummary from "./CTASummary";
import MultipleChoiceSummary from "./MultipleChoiceSummary";
import NPSSummary from "./NPSSummary";
import OpenTextSummary from "./OpenTextSummary";
import RatingSummary from "./RatingSummary";
import FileUploadSummary from "./FileUploadSummary";
import PictureChoiceSummary from "./PictureChoiceSummary";

interface SummaryListProps {
  environment: TEnvironment;
  form: Tform;
  responses: TResponse[];
  responsesPerPage: number;
}

export default function SummaryList({ environment, form, responses, responsesPerPage }: SummaryListProps) {
  const getSummaryData = (): TformQuestionSummary<TformQuestion>[] =>
    form.questions.map((question) => {
      const questionResponses = responses
        .filter((response) => question.id in response.data)
        .map((r) => ({
          id: r.id,
          value: r.data[question.id],
          updatedAt: r.updatedAt,
          person: r.person,
        }));
      return {
        question,
        responses: questionResponses,
      };
    });

  return (
    <>
      <div className="mt-10 space-y-8">
        {form.type === "web" && responses.length === 0 && !environment.widgetSetupCompleted ? (
          <EmptyInAppforms environment={environment} />
        ) : responses.length === 0 ? (
          <EmptySpaceFiller
            type="response"
            environment={environment}
            noWidgetRequired={form.type === "link"}
          />
        ) : (
          <>
            {getSummaryData().map((questionSummary) => {
              if (questionSummary.question.type === TformQuestionType.OpenText) {
                return (
                  <OpenTextSummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TformQuestionSummary<TformOpenTextQuestion>}
                    environmentId={environment.id}
                    responsesPerPage={responsesPerPage}
                  />
                );
              }
              if (
                questionSummary.question.type === TformQuestionType.MultipleChoiceSingle ||
                questionSummary.question.type === TformQuestionType.MultipleChoiceMulti
              ) {
                return (
                  <MultipleChoiceSummary
                    key={questionSummary.question.id}
                    questionSummary={
                      questionSummary as TformQuestionSummary<
                        TformMultipleChoiceMultiQuestion | TformMultipleChoiceSingleQuestion
                      >
                    }
                    environmentId={environment.id}
                    formType={form.type}
                    responsesPerPage={responsesPerPage}
                  />
                );
              }
              if (questionSummary.question.type === TformQuestionType.NPS) {
                return (
                  <NPSSummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TformQuestionSummary<TformNPSQuestion>}
                  />
                );
              }
              if (questionSummary.question.type === TformQuestionType.CTA) {
                return (
                  <CTASummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TformQuestionSummary<TformCTAQuestion>}
                  />
                );
              }
              if (questionSummary.question.type === TformQuestionType.Rating) {
                return (
                  <RatingSummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TformQuestionSummary<TformRatingQuestion>}
                  />
                );
              }
              if (questionSummary.question.type === TformQuestionType.Consent) {
                return (
                  <ConsentSummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TformQuestionSummary<TformConsentQuestion>}
                  />
                );
              }
              if (questionSummary.question.type === TformQuestionType.FileUpload) {
                return (
                  <FileUploadSummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TformQuestionSummary<TformFileUploadQuestion>}
                    environmentId={environment.id}
                  />
                );
              }
              if (questionSummary.question.type === TformQuestionType.PictureSelection) {
                return (
                  <PictureChoiceSummary
                    key={questionSummary.question.id}
                    questionSummary={
                      questionSummary as TformQuestionSummary<TformPictureSelectionQuestion>
                    }
                  />
                );
              }
              return null;
            })}
            {form.hiddenFields?.enabled &&
              form.hiddenFields.fieldIds?.map((question) => {
                return (
                  <HiddenFieldsSummary
                    environment={environment}
                    question={question}
                    responses={responses}
                    form={form}
                    key={question}
                  />
                );
              })}
          </>
        )}
      </div>
    </>
  );
}
