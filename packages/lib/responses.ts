import { TSurveyQuestion } from "@fastform/types/surveys";
import { TResponse } from "@fastform/types/responses";

export const getQuestionResponseMapping = (
  form: { questions: TSurveyQuestion[] },
  response: TResponse
): { question: string; answer: string }[] => {
  const questionResponseMapping: { question: string; answer: string }[] = [];

  for (const question of form.questions) {
    const answer = response.data[question.id];

    questionResponseMapping.push({
      question: question.headline,
      answer: typeof answer !== "undefined" ? answer.toString() : "",
    });
  }

  return questionResponseMapping;
};
