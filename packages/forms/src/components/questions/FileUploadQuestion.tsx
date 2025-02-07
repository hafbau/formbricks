import { TResponseData, TResponseTtc } from "@fastform/types/responses";
import type { TFormFileUploadQuestion } from "@fastform/types/forms";
import { BackButton } from "../buttons/BackButton";
import SubmitButton from "../buttons/SubmitButton";
import FileInput from "../general/FileInput";
import Headline from "../general/Headline";
import Subheader from "../general/Subheader";
import { TUploadFileConfig } from "@fastform/types/storage";
import { useState } from "preact/hooks";
import { getUpdatedTtc, useTtc } from "@/lib/ttc";

interface FileUploadQuestionProps {
  question: TFormFileUploadQuestion;
  value: string | number | string[];
  onChange: (responseData: TResponseData) => void;
  onSubmit: (data: TResponseData, ttc: TResponseTtc) => void;
  onBack: () => void;
  onFileUpload: (file: File, config?: TUploadFileConfig) => Promise<string>;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  formId: string;
  ttc: TResponseTtc;
  setTtc: (ttc: TResponseTtc) => void;
}

export default function FileUploadQuestion({
  question,
  value,
  onChange,
  onSubmit,
  onBack,
  isFirstQuestion,
  isLastQuestion,
  formId,
  onFileUpload,
  ttc,
  setTtc,
}: FileUploadQuestionProps) {
  const [startTime, setStartTime] = useState(performance.now());

  useTtc(question.id, ttc, setTtc, startTime, setStartTime);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const updatedTtcObj = getUpdatedTtc(ttc, question.id, performance.now() - startTime);
        setTtc(updatedTtcObj);
        if (question.required) {
          if (value && (typeof value === "string" || Array.isArray(value)) && value.length > 0) {
            onSubmit({ [question.id]: typeof value === "string" ? [value] : value }, updatedTtcObj);
          } else {
            alert("Please upload a file");
          }
        } else {
          if (value) {
            onSubmit({ [question.id]: typeof value === "string" ? [value] : value }, updatedTtcObj);
          } else {
            onSubmit({ [question.id]: "skipped" }, updatedTtcObj);
          }
        }
      }}
      className="w-full">
      <Headline headline={question.headline} questionId={question.id} required={question.required} />
      <Subheader subheader={question.subheader} questionId={question.id} />

      <FileInput
        formId={formId}
        onFileUpload={onFileUpload}
        onUploadCallback={(urls: string[]) => {
          if (urls) {
            onChange({ [question.id]: urls });
          } else {
            onChange({ [question.id]: "skipped" });
          }
        }}
        fileUrls={value as string[]}
        allowMultipleFiles={question.allowMultipleFiles}
        {...(!!question.allowedFileExtensions
          ? { allowedFileExtensions: question.allowedFileExtensions }
          : {})}
        {...(!!question.maxSizeInMB ? { maxSizeInMB: question.maxSizeInMB } : {})}
      />

      <div className="mt-4 flex w-full justify-between">
        {!isFirstQuestion && (
          <BackButton
            backButtonLabel={question.backButtonLabel}
            onClick={() => {
              onBack();
            }}
          />
        )}
        <div></div>
        <SubmitButton buttonLabel={question.buttonLabel} isLastQuestion={isLastQuestion} onClick={() => {}} />
      </div>
    </form>
  );
}
