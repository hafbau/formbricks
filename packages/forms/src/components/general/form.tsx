import FormbricksBranding from "@/components/general/FormbricksBranding";
import ProgressBar from "@/components/general/ProgressBar";
import { AutoCloseWrapper } from "@/components/wrappers/AutoCloseWrapper";
import { evaluateCondition } from "@/lib/logicEvaluator";
import { cn } from "@/lib/utils";
import { formBaseProps } from "@/types/props";
import type { TResponseData, TResponseTtc } from "@fastform/types/responses";
import { useEffect, useRef, useState } from "preact/hooks";
import QuestionConditional from "./QuestionConditional";
import ThankYouCard from "./ThankYouCard";
import WelcomeCard from "./WelcomeCard";

export function Form({
  form,
  isBrandingEnabled,
  activeQuestionId,
  onDisplay = () => {},
  onActiveQuestionChange = () => {},
  onResponse = () => {},
  onClose = () => {},
  onFinished = () => {},
  isRedirectDisabled = false,
  prefillResponseData,
  onFileUpload,
  responseCount,
}: formBaseProps) {
  const [questionId, setQuestionId] = useState(
    activeQuestionId || (form.welcomeCard.enabled ? "start" : form?.questions[0]?.id)
  );
  const [loadingElement, setLoadingElement] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [responseData, setResponseData] = useState<TResponseData>({});
  const currentQuestionIndex = form.questions.findIndex((q) => q.id === questionId);
  const currentQuestion = form.questions[currentQuestionIndex];
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [ttc, setTtc] = useState<TResponseTtc>({});
  useEffect(() => {
    if (activeQuestionId === "hidden") return;
    if (activeQuestionId === "start" && !form.welcomeCard.enabled) {
      setQuestionId(form?.questions[0]?.id);
      return;
    }
    setQuestionId(activeQuestionId || (form.welcomeCard.enabled ? "start" : form?.questions[0]?.id));
  }, [activeQuestionId, form.questions, form.welcomeCard.enabled]);

  useEffect(() => {
    // scroll to top when question changes
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [questionId]);

  useEffect(() => {
    // call onDisplay when component is mounted
    onDisplay();
    if (prefillResponseData) {
      onSubmit(prefillResponseData, {}, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  let currIdx = currentQuestionIndex;
  let currQues = currentQuestion;
  function getNextQuestionId(data: TResponseData, isFromPrefilling: Boolean = false): string {
    const questions = form.questions;
    const responseValue = data[questionId];

    if (questionId === "start") {
      if (!isFromPrefilling) {
        return questions[0]?.id || "end";
      } else {
        currIdx = 0;
        currQues = questions[0];
      }
    }
    if (currIdx === -1) throw new Error("Question not found");

    if (currQues?.logic && currQues?.logic.length > 0) {
      for (let logic of currQues.logic) {
        if (!logic.destination) continue;

        if (evaluateCondition(logic, responseValue)) {
          return logic.destination;
        }
      }
    }
    return questions[currIdx + 1]?.id || "end";
  }

  const onChange = (responseDataUpdate: TResponseData) => {
    const updatedResponseData = { ...responseData, ...responseDataUpdate };
    setResponseData(updatedResponseData);
  };

  const onSubmit = (responseData: TResponseData, ttc: TResponseTtc, isFromPrefilling: Boolean = false) => {
    const questionId = Object.keys(responseData)[0];
    setLoadingElement(true);
    const nextQuestionId = getNextQuestionId(responseData, isFromPrefilling);
    const finished = nextQuestionId === "end";
    onResponse({ data: responseData, ttc, finished });
    if (finished) {
      onFinished();
    }
    setQuestionId(nextQuestionId);
    // add to history
    setHistory([...history, questionId]);
    setLoadingElement(false);
    onActiveQuestionChange(nextQuestionId);
  };

  const onBack = (): void => {
    let prevQuestionId;
    // use history if available
    if (history?.length > 0) {
      const newHistory = [...history];
      prevQuestionId = newHistory.pop();
      if (prefillResponseData && prevQuestionId === form.questions[0].id) return;
      setHistory(newHistory);
    } else {
      // otherwise go back to previous question in array
      prevQuestionId = form.questions[currIdx - 1]?.id;
    }
    if (!prevQuestionId) throw new Error("Question not found");
    setQuestionId(prevQuestionId);
    onActiveQuestionChange(prevQuestionId);
  };
  function getCardContent() {
    if (questionId === "start" && form.welcomeCard.enabled) {
      return (
        <WelcomeCard
          headline={form.welcomeCard.headline}
          html={form.welcomeCard.html}
          fileUrl={form.welcomeCard.fileUrl}
          buttonLabel={form.welcomeCard.buttonLabel}
          onSubmit={onSubmit}
          form={form}
          responseCount={responseCount}
        />
      );
    } else if (questionId === "end" && form.thankYouCard.enabled) {
      return (
        <ThankYouCard
          headline={form.thankYouCard.headline}
          subheader={form.thankYouCard.subheader}
          redirectUrl={form.redirectUrl}
          isRedirectDisabled={isRedirectDisabled}
        />
      );
    } else {
      const currQues = form.questions.find((q) => q.id === questionId);
      return (
        currQues && (
          <QuestionConditional
            formId={form.id}
            question={currQues}
            value={responseData[currQues.id]}
            onChange={onChange}
            onSubmit={onSubmit}
            onBack={onBack}
            ttc={ttc}
            setTtc={setTtc}
            onFileUpload={onFileUpload}
            isFirstQuestion={
              history && prefillResponseData
                ? history[history.length - 1] === form.questions[0].id
                : currQues.id === form?.questions[0]?.id
            }
            isLastQuestion={currQues.id === form.questions[form.questions.length - 1].id}
          />
        )
      );
    }
  }

  return (
    <>
      <AutoCloseWrapper form={form} onClose={onClose}>
        <div className="flex h-full w-full flex-col justify-between rounded-lg bg-[--fb-form-background-color] px-6 pb-3 pt-6">
          <div ref={contentRef} className={cn(loadingElement ? "animate-pulse opacity-60" : "", "my-auto")}>
            {form.questions.length === 0 && !form.welcomeCard.enabled && !form.thankYouCard.enabled ? (
              // Handle the case when there are no questions and both welcome and thank you cards are disabled
              <div>No questions available.</div>
            ) : (
              getCardContent()
            )}
          </div>
          <div className="mt-8">
            {isBrandingEnabled && <FormbricksBranding />}
            <ProgressBar form={form} questionId={questionId} />
          </div>
        </div>
      </AutoCloseWrapper>
    </>
  );
}
