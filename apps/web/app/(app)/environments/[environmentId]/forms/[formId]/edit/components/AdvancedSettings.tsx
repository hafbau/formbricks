import LogicEditor from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/components/LogicEditor";
import { TForm, TformQuestion } from "@fastform/types/forms";
import UpdateQuestionId from "./UpdateQuestionId";

interface AdvancedSettingsProps {
  question: TformQuestion;
  questionIdx: number;
  localform: TForm;
  updateQuestion: (questionIdx: number, updatedAttributes: any) => void;
}

export default function AdvancedSettings({
  question,
  questionIdx,
  localform,
  updateQuestion,
}: AdvancedSettingsProps) {
  return (
    <div>
      <div className="mb-4">
        <LogicEditor
          question={question}
          updateQuestion={updateQuestion}
          localform={localform}
          questionIdx={questionIdx}
        />
      </div>

      <UpdateQuestionId
        question={question}
        questionIdx={questionIdx}
        localform={localform}
        updateQuestion={updateQuestion}
      />
    </div>
  );
}
