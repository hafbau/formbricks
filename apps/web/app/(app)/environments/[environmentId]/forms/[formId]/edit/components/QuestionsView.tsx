"use client";

import HiddenFieldsCard from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/components/HiddenFieldsCard";
import { TProduct } from "@fastform/types/product";
import { TformQuestion, TForm } from "@fastform/types/forms";
import { createId } from "@paralleldrive/cuid2";
import { useMemo, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import toast from "react-hot-toast";
import AddQuestionButton from "./AddQuestionButton";
import EditThankYouCard from "./EditThankYouCard";
import EditWelcomeCard from "./EditWelcomeCard";
import QuestionCard from "./QuestionCard";
import { StrictModeDroppable } from "./StrictModeDroppable";
import { validateQuestion } from "./Validation";

interface QuestionsViewProps {
  localform: TForm;
  setLocalform: (form: TForm) => void;
  activeQuestionId: string | null;
  setActiveQuestionId: (questionId: string | null) => void;
  product: TProduct;
  invalidQuestions: String[] | null;
  setInvalidQuestions: (invalidQuestions: String[] | null) => void;
}

export default function QuestionsView({
  activeQuestionId,
  setActiveQuestionId,
  localform,
  setLocalform,
  product,
  invalidQuestions,
  setInvalidQuestions,
}: QuestionsViewProps) {
  const internalQuestionIdMap = useMemo(() => {
    return localform.questions.reduce((acc, question) => {
      acc[question.id] = createId();
      return acc;
    }, {});
  }, []);

  const [backButtonLabel, setbackButtonLabel] = useState(null);

  const handleQuestionLogicChange = (form: TForm, compareId: string, updatedId: string): TForm => {
    form.questions.forEach((question) => {
      if (!question.logic) return;
      question.logic.forEach((rule) => {
        if (rule.destination === compareId) {
          rule.destination = updatedId;
        }
      });
    });
    return form;
  };

  // function to validate individual questions
  const validateform = (question: TformQuestion) => {
    // prevent this function to execute further if user hasnt still tried to save the form
    if (invalidQuestions === null) {
      return;
    }
    let temp = JSON.parse(JSON.stringify(invalidQuestions));
    if (validateQuestion(question)) {
      temp = invalidQuestions.filter((id) => id !== question.id);
      setInvalidQuestions(temp);
    } else if (!invalidQuestions.includes(question.id)) {
      temp.push(question.id);
      setInvalidQuestions(temp);
    }
  };

  const updateQuestion = (questionIdx: number, updatedAttributes: any) => {
    let updatedform = { ...localform };

    if ("id" in updatedAttributes) {
      // if the form whose id is to be changed is linked to logic of any other form then changing it
      const initialQuestionId = updatedform.questions[questionIdx].id;
      updatedform = handleQuestionLogicChange(updatedform, initialQuestionId, updatedAttributes.id);
      if (invalidQuestions?.includes(initialQuestionId)) {
        setInvalidQuestions(
          invalidQuestions.map((id) => (id === initialQuestionId ? updatedAttributes.id : id))
        );
      }

      // relink the question to internal Id
      internalQuestionIdMap[updatedAttributes.id] =
        internalQuestionIdMap[localform.questions[questionIdx].id];
      delete internalQuestionIdMap[localform.questions[questionIdx].id];
      setActiveQuestionId(updatedAttributes.id);
    }

    updatedform.questions[questionIdx] = {
      ...updatedform.questions[questionIdx],
      ...updatedAttributes,
    };

    if ("backButtonLabel" in updatedAttributes) {
      updatedform.questions.forEach((question) => {
        question.backButtonLabel = updatedAttributes.backButtonLabel;
      });
      setbackButtonLabel(updatedAttributes.backButtonLabel);
    }
    setLocalform(updatedform);
    validateform(updatedform.questions[questionIdx]);
  };

  const deleteQuestion = (questionIdx: number) => {
    const questionId = localform.questions[questionIdx].id;
    let updatedform: TForm = { ...localform };
    updatedform.questions.splice(questionIdx, 1);

    updatedform = handleQuestionLogicChange(updatedform, questionId, "end");

    setLocalform(updatedform);
    delete internalQuestionIdMap[questionId];

    if (questionId === activeQuestionId) {
      if (questionIdx < localform.questions.length - 1) {
        setActiveQuestionId(localform.questions[questionIdx + 1].id);
      } else if (localform.thankYouCard.enabled) {
        setActiveQuestionId("thank-you-card");
      } else {
        setActiveQuestionId(localform.questions[questionIdx - 1].id);
      }
    }
    toast.success("Question deleted.");
  };

  const duplicateQuestion = (questionIdx: number) => {
    const questionToDuplicate = JSON.parse(JSON.stringify(localform.questions[questionIdx]));

    const newQuestionId = createId();

    // create a copy of the question with a new id
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: newQuestionId,
    };

    // insert the new question right after the original one
    const updatedform = { ...localform };
    updatedform.questions.splice(questionIdx + 1, 0, duplicatedQuestion);

    setLocalform(updatedform);
    setActiveQuestionId(newQuestionId);
    internalQuestionIdMap[newQuestionId] = createId();

    toast.success("Question duplicated.");
  };

  const addQuestion = (question: any) => {
    const updatedform = { ...localform };
    if (backButtonLabel) {
      question.backButtonLabel = backButtonLabel;
    }

    updatedform.questions.push({ ...question, isDraft: true });

    setLocalform(updatedform);
    setActiveQuestionId(question.id);
    internalQuestionIdMap[question.id] = createId();
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const newQuestions = Array.from(localform.questions);
    const [reorderedQuestion] = newQuestions.splice(result.source.index, 1);
    newQuestions.splice(result.destination.index, 0, reorderedQuestion);
    const updatedform = { ...localform, questions: newQuestions };
    setLocalform(updatedform);
  };

  const moveQuestion = (questionIndex: number, up: boolean) => {
    const newQuestions = Array.from(localform.questions);
    const [reorderedQuestion] = newQuestions.splice(questionIndex, 1);
    const destinationIndex = up ? questionIndex - 1 : questionIndex + 1;
    newQuestions.splice(destinationIndex, 0, reorderedQuestion);
    const updatedform = { ...localform, questions: newQuestions };
    setLocalform(updatedform);
  };

  return (
    <div className="mt-12 px-5 py-4">
      <div className="mb-5 flex flex-col gap-5">
        <EditWelcomeCard
          localform={localform}
          setLocalform={setLocalform}
          setActiveQuestionId={setActiveQuestionId}
          activeQuestionId={activeQuestionId}
        />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="mb-5 grid grid-cols-1 gap-5 ">
          <StrictModeDroppable droppableId="questionsList">
            {(provided) => (
              <div className="grid gap-5" ref={provided.innerRef} {...provided.droppableProps}>
                {localform.questions.map((question, questionIdx) => (
                  // display a question form
                  <QuestionCard
                    key={internalQuestionIdMap[question.id]}
                    localform={localform}
                    product={product}
                    questionIdx={questionIdx}
                    moveQuestion={moveQuestion}
                    updateQuestion={updateQuestion}
                    duplicateQuestion={duplicateQuestion}
                    deleteQuestion={deleteQuestion}
                    activeQuestionId={activeQuestionId}
                    setActiveQuestionId={setActiveQuestionId}
                    lastQuestion={questionIdx === localform.questions.length - 1}
                    isInValid={invalidQuestions ? invalidQuestions.includes(question.id) : false}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </div>
      </DragDropContext>
      <AddQuestionButton addQuestion={addQuestion} product={product} />
      <div className="mt-5 flex flex-col gap-5">
        <EditThankYouCard
          localform={localform}
          setLocalform={setLocalform}
          setActiveQuestionId={setActiveQuestionId}
          activeQuestionId={activeQuestionId}
        />

        {localform.type === "link" ? (
          <HiddenFieldsCard
            localform={localform}
            setLocalform={setLocalform}
            setActiveQuestionId={setActiveQuestionId}
            activeQuestionId={activeQuestionId}
          />
        ) : null}
      </div>
    </div>
  );
}
