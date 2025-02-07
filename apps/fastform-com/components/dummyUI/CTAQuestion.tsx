import { TFormCTAQuestion } from "@fastform/types/forms";
import Headline from "./Headline";
import HtmlBody from "./HtmlBody";

interface CTAQuestionProps {
  question: TFormCTAQuestion;
  onSubmit: (data: { [x: string]: any }) => void;
  lastQuestion: boolean;
  brandColor: string;
}

export default function CTAQuestion({ question, onSubmit, lastQuestion, brandColor }: CTAQuestionProps) {
  return (
    <div>
      <Headline headline={question.headline} questionId={question.id} />
      <HtmlBody htmlString={question.html || ""} questionId={question.id} />

      <div className="mt-4 flex w-full justify-end">
        <div></div>
        {!question.required && (
          <button
            type="button"
            onClick={() => {
              onSubmit({ [question.id]: "dismissed" });
            }}
            className="mr-4 flex items-center rounded-md px-3 py-3 text-base font-medium leading-4 text-slate-500 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:border-slate-400 dark:text-slate-400">
            {question.dismissButtonLabel || "Skip"}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (question.buttonExternal && question.buttonUrl) {
              window?.open(question.buttonUrl, "_blank")?.focus();
            }
            onSubmit({ [question.id]: "clicked" });
          }}
          className="flex items-center rounded-md border border-transparent px-3 py-3 text-base font-medium leading-4 text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          style={{ backgroundColor: brandColor }}>
          {question.buttonLabel || (lastQuestion ? "Finish" : "Next")}
        </button>
      </div>
    </div>
  );
}
