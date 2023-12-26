import EmptyInAppforms from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/components/EmptyInAppforms";
import ConsentSummary from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/components/ConsentSummary";
import HiddenFieldsSummary from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/components/HiddenFieldsSummary";
import EmptySpaceFiller from "@fastform/ui/EmptySpaceFiller";
import { TFormQuestionType } from "@fastform/types/forms";
import type {
  TFormFileUploadQuestion,
  TFormPictureSelectionQuestion,
  TFormQuestionSummary,
} from "@fastform/types/forms";
import { TEnvironment } from "@fastform/types/environment";
import { TResponse } from "@fastform/types/responses";
import {
  TForm,
  TFormCTAQuestion,
  TFormConsentQuestion,
  TFormMultipleChoiceMultiQuestion,
  TFormMultipleChoiceSingleQuestion,
  TFormNPSQuestion,
  TFormOpenTextQuestion,
  TFormQuestion,
  TFormRatingQuestion,
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
  form: TForm;
  responses: TResponse[];
  responsesPerPage: number;
}

export default function SummaryList({ environment, form, responses, responsesPerPage }: SummaryListProps) {
  const getSummaryData = (): TFormQuestionSummary<TFormQuestion>[] =>
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
              if (questionSummary.question.type === TFormQuestionType.OpenText) {
                return (
                  <OpenTextSummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TFormQuestionSummary<TFormOpenTextQuestion>}
                    environmentId={environment.id}
                    responsesPerPage={responsesPerPage}
                  />
                );
              }
              if (
                questionSummary.question.type === TFormQuestionType.MultipleChoiceSingle ||
                questionSummary.question.type === TFormQuestionType.MultipleChoiceMulti
              ) {
                return (
                  <MultipleChoiceSummary
                    key={questionSummary.question.id}
                    questionSummary={
                      questionSummary as TFormQuestionSummary<
                        TFormMultipleChoiceMultiQuestion | TFormMultipleChoiceSingleQuestion
                      >
                    }
                    environmentId={environment.id}
                    formType={form.type}
                    responsesPerPage={responsesPerPage}
                  />
                );
              }
              if (questionSummary.question.type === TFormQuestionType.NPS) {
                return (
                  <NPSSummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TFormQuestionSummary<TFormNPSQuestion>}
                  />
                );
              }
              if (questionSummary.question.type === TFormQuestionType.CTA) {
                return (
                  <CTASummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TFormQuestionSummary<TFormCTAQuestion>}
                  />
                );
              }
              if (questionSummary.question.type === TFormQuestionType.Rating) {
                return (
                  <RatingSummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TFormQuestionSummary<TFormRatingQuestion>}
                  />
                );
              }
              if (questionSummary.question.type === TFormQuestionType.Consent) {
                return (
                  <ConsentSummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TFormQuestionSummary<TFormConsentQuestion>}
                  />
                );
              }
              if (questionSummary.question.type === TFormQuestionType.FileUpload) {
                return (
                  <FileUploadSummary
                    key={questionSummary.question.id}
                    questionSummary={questionSummary as TFormQuestionSummary<TFormFileUploadQuestion>}
                    environmentId={environment.id}
                  />
                );
              }
              if (questionSummary.question.type === TFormQuestionType.PictureSelection) {
                return (
                  <PictureChoiceSummary
                    key={questionSummary.question.id}
                    questionSummary={
                      questionSummary as TFormQuestionSummary<TFormPictureSelectionQuestion>
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
