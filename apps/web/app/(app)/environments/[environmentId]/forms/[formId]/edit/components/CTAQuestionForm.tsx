"use client";

import { BackButtonInput } from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/components/QuestionCard";
import QuestionFormInput from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/components/QuestionFormInput";
import { md } from "@fastform/lib/markdownIt";
import { TForm, TFormCTAQuestion } from "@fastform/types/forms";
import { Editor } from "@fastform/ui/Editor";
import { Input } from "@fastform/ui/Input";
import { Label } from "@fastform/ui/Label";
import { RadioGroup, RadioGroupItem } from "@fastform/ui/RadioGroup";
import { useState } from "react";

interface CTAQuestionFormProps {
  localform: TForm;
  question: TFormCTAQuestion;
  questionIdx: number;
  updateQuestion: (questionIdx: number, updatedAttributes: any) => void;
  lastQuestion: boolean;
  isInValid: boolean;
}

export default function CTAQuestionForm({
  question,
  questionIdx,
  updateQuestion,
  lastQuestion,
  isInValid,
  localform,
}: CTAQuestionFormProps): JSX.Element {
  const [firstRender, setFirstRender] = useState(true);
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
        <Label htmlFor="subheader">Description</Label>
        <div className="mt-2">
          <Editor
            getText={() =>
              md.render(
                question.html || "We would love to talk to you and learn more about how you use our product."
              )
            }
            setText={(value: string) => {
              updateQuestion(questionIdx, { html: value });
            }}
            excludedToolbarItems={["blockType"]}
            disableLists
            firstRender={firstRender}
            setFirstRender={setFirstRender}
          />
        </div>
      </div>

      <RadioGroup
        className="mt-3 flex"
        defaultValue="internal"
        value={question.buttonExternal ? "external" : "internal"}
        onValueChange={(e) => updateQuestion(questionIdx, { buttonExternal: e === "external" })}>
        <div className="flex items-center space-x-2 rounded-lg border border-slate-200 p-3 dark:border-slate-500">
          <RadioGroupItem value="internal" id="internal" className="bg-slate-50" />
          <Label htmlFor="internal" className="cursor-pointer dark:text-slate-200">
            Button to continue in form
          </Label>
        </div>
        <div className="flex items-center space-x-2 rounded-lg border border-slate-200 p-3 dark:border-slate-500">
          <RadioGroupItem value="external" id="external" className="bg-slate-50" />
          <Label htmlFor="external" className="cursor-pointer dark:text-slate-200">
            Button to link to external URL
          </Label>
        </div>
      </RadioGroup>

      <div className="mt-3 flex justify-between gap-8">
        <div className="flex w-full space-x-2">
          <div className="w-full">
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
          {questionIdx !== 0 && (
            <BackButtonInput
              value={question.backButtonLabel}
              onChange={(e) => updateQuestion(questionIdx, { backButtonLabel: e.target.value })}
            />
          )}
        </div>
      </div>

      {question.buttonExternal && (
        <div className="mt-3 flex-1">
          <Label htmlFor="buttonLabel">Button URL</Label>
          <div className="mt-2">
            <Input
              id="buttonUrl"
              name="buttonUrl"
              value={question.buttonUrl}
              placeholder="https://website.com"
              onChange={(e) => updateQuestion(questionIdx, { buttonUrl: e.target.value })}
            />
          </div>
        </div>
      )}

      {!question.required && (
        <div className="mt-3 flex-1">
          <Label htmlFor="buttonLabel">Skip Button Label</Label>
          <div className="mt-2">
            <Input
              id="dismissButtonLabel"
              name="dismissButtonLabel"
              value={question.dismissButtonLabel}
              placeholder="Skip"
              onChange={(e) => updateQuestion(questionIdx, { dismissButtonLabel: e.target.value })}
            />
          </div>
        </div>
      )}
    </form>
  );
}
