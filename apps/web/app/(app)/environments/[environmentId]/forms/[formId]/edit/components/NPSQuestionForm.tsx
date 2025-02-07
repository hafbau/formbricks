"use client";

import QuestionFormInput from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/components/QuestionFormInput";
import { TForm, TFormNPSQuestion } from "@fastform/types/forms";
import { Button } from "@fastform/ui/Button";
import { Input } from "@fastform/ui/Input";
import { Label } from "@fastform/ui/Label";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

interface NPSQuestionFormProps {
  localform: TForm;
  question: TFormNPSQuestion;
  questionIdx: number;
  updateQuestion: (questionIdx: number, updatedAttributes: any) => void;
  lastQuestion: boolean;
  isInValid: boolean;
}

export default function NPSQuestionForm({
  question,
  questionIdx,
  updateQuestion,
  lastQuestion,
  isInValid,
  localform,
}: NPSQuestionFormProps): JSX.Element {
  const [showSubheader, setShowSubheader] = useState(!!question.subheader);
  const environmentId = localform.environmentId;

  return (
    <form>
      <QuestionFormInput
        environmentId={environmentId}
        isInValid={isInValid}
        question={question}
        questionIdx={questionIdx}
        updateQuestion={updateQuestion}
      />

      <div className="mt-3">
        {showSubheader && (
          <>
            <Label htmlFor="subheader">Description</Label>
            <div className="mt-2 inline-flex w-full items-center">
              <Input
                id="subheader"
                name="subheader"
                value={question.subheader}
                onChange={(e) => updateQuestion(questionIdx, { subheader: e.target.value })}
              />
              <TrashIcon
                className="ml-2 h-4 w-4 cursor-pointer text-slate-400 hover:text-slate-500"
                onClick={() => {
                  setShowSubheader(false);
                  updateQuestion(questionIdx, { subheader: "" });
                }}
              />
            </div>
          </>
        )}
        {!showSubheader && (
          <Button size="sm" variant="minimal" type="button" onClick={() => setShowSubheader(true)}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Add Description
          </Button>
        )}
      </div>

      <div className="mt-3 flex justify-between">
        <div>
          <Label htmlFor="subheader">Lower label</Label>
          <div className="mt-2">
            <Input
              id="subheader"
              name="subheader"
              value={question.lowerLabel}
              onChange={(e) => updateQuestion(questionIdx, { lowerLabel: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="subheader">Upper label</Label>
          <div className="mt-2">
            <Input
              id="subheader"
              name="subheader"
              value={question.upperLabel}
              onChange={(e) => updateQuestion(questionIdx, { upperLabel: e.target.value })}
            />
          </div>
        </div>
      </div>

      {!question.required && (
        <div className="mt-3">
          <Label htmlFor="buttonLabel">Button Label</Label>
          <div className="mt-2">
            <Input
              id="buttonLabel"
              name="buttonLabel"
              value={question.buttonLabel}
              placeholder={lastQuestion ? "Finish" : "Next"}
              onChange={(e) => updateQuestion(questionIdx, { buttonLabel: e.target.value })}
            />
          </div>
        </div>
      )}
    </form>
  );
}
