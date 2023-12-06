import { TSurvey } from "@fastform/types/surveys";
import Progress from "./Progress";
import { calculateElementIdx } from "@/lib/utils";
import { useCallback, useMemo } from "preact/hooks";

interface ProgressBarProps {
  form: TSurvey;
  questionId: string;
}

export default function ProgressBar({ form, questionId }: ProgressBarProps) {
  const currentQuestionIdx = useMemo(
    () => form.questions.findIndex((e) => e.id === questionId),
    [form, questionId]
  );

  const calculateProgress = useCallback((questionId: string, form: TSurvey, progress: number) => {
    if (form.questions.length === 0) return 0;
    let currentQustionIdx = form.questions.findIndex((e) => e.id === questionId);
    if (currentQustionIdx === -1) currentQustionIdx = 0;
    const elementIdx = calculateElementIdx(form, currentQustionIdx);

    const newProgress = elementIdx / form.questions.length;
    let updatedProgress = progress;
    if (newProgress > progress) {
      updatedProgress = newProgress;
    } else if (newProgress <= progress && progress + 0.1 <= 1) {
      updatedProgress = progress + 0.1;
    }
    return updatedProgress;
  }, []);

  const progressArray = useMemo(() => {
    let progress = 0;
    let progressArrayTemp: number[] = [];
    form.questions.forEach((question) => {
      progress = calculateProgress(question.id, form, progress);
      progressArrayTemp.push(progress);
    });
    return progressArrayTemp;
  }, [calculateProgress, form]);

  return <Progress progress={questionId === "end" ? 1 : progressArray[currentQuestionIdx]} />;
}
