"use client";

import QuestionFormInput from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/components/QuestionFormInput";
import { md } from "@fastform/lib/markdownIt";
import { TForm, TFormConsentQuestion } from "@fastform/types/forms";
import { Editor } from "@fastform/ui/Editor";
import { Input } from "@fastform/ui/Input";
import { Label } from "@fastform/ui/Label";
import { useState } from "react";

interface ConsentQuestionFormProps {
  localform: TForm;
  question: TFormConsentQuestion;
  questionIdx: number;
  updateQuestion: (questionIdx: number, updatedAttributes: any) => void;
  isInValid: boolean;
}

export default function ConsentQuestionForm({
  question,
  questionIdx,
  updateQuestion,
  isInValid,
  localform,
}: ConsentQuestionFormProps): JSX.Element {
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

      <div className="mt-3">
        <Label htmlFor="label">Checkbox Label</Label>
        <Input
          id="label"
          name="label"
          className="mt-2"
          value={question.label}
          placeholder="I agree to the terms and conditions"
          onChange={(e) => updateQuestion(questionIdx, { label: e.target.value })}
          isInvalid={isInValid && question.label.trim() === ""}
        />
      </div>
      {/* <div className="mt-3">
        <Label htmlFor="buttonLabel">Button Label</Label>
        <Input
          id="buttonLabel"
          name="buttonLabel"
          className="mt-2"
          value={question.buttonLabel}
          placeholder={lastQuestion ? "Finish" : "Next"}
          onChange={(e) => updateQuestion(questionIdx, { buttonLabel: e.target.value })}
        />
      </div> */}
    </form>
  );
}
