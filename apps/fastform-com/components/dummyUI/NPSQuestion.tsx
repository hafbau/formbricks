import { useState } from "react";
import { cn } from "@fastform/lib/cn";
import { TFormNPSQuestion } from "@fastform/types/forms";
import Headline from "./Headline";
import Subheader from "./Subheader";

interface NPSQuestionProps {
  question: TFormNPSQuestion;
  onSubmit: (data: { [x: string]: any }) => void;
  lastQuestion: boolean;
  brandColor: string;
}

export default function NPSQuestion({ question, onSubmit, lastQuestion, brandColor }: NPSQuestionProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  const handleSelect = (number: number) => {
    setSelectedChoice(number);
    if (question.required) {
      onSubmit({
        [question.id]: number,
      });
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        const data = {
          [question.id]: selectedChoice,
        };

        onSubmit(data);
        // reset form
      }}>
      <Headline headline={question.headline} questionId={question.id} />
      <Subheader subheader={question.subheader} questionId={question.id} />
      <div className="my-4">
        <fieldset>
          <legend className="sr-only">Options</legend>
          <div className="flex">
            {Array.from({ length: 11 }, (_, i) => i).map((number) => (
              <label
                key={number}
                className={cn(
                  selectedChoice === number
                    ? "z-10  bg-slate-50  dark:bg-slate-500"
                    : "dark:bg-slate-700 dark:hover:bg-slate-500",
                  "relative h-10 flex-1 cursor-pointer border bg-white text-center text-sm leading-10 text-slate-900 first:rounded-l-md last:rounded-r-md  hover:bg-gray-100 focus:outline-none dark:border-slate-600  dark:text-white "
                )}>
                <input
                  type="radio"
                  name="nps"
                  value={number}
                  className="absolute h-full w-full cursor-pointer opacity-0"
                  onChange={() => handleSelect(number)}
                  required={question.required}
                />
                {number}
              </label>
            ))}
          </div>
          <div className="flex justify-between px-1.5 text-xs leading-6 text-slate-500">
            <p>{question.lowerLabel}</p>
            <p>{question.upperLabel}</p>
          </div>
        </fieldset>
      </div>
      {!question.required && (
        <div className="mt-4 flex w-full justify-between">
          <div></div>
          <button
            type="submit"
            className="flex items-center rounded-md border border-transparent px-3 py-3 text-base font-medium leading-4 text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            style={{ backgroundColor: brandColor }}>
            {question.buttonLabel || (lastQuestion ? "Finish" : "Next")}
          </button>
        </div>
      )}
    </form>
  );
}
