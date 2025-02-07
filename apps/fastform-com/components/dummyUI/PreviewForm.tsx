import { useState } from "react";
import Modal from "./Modal";
import QuestionConditional from "./QuestionConditional";
import { TFormQuestion, TForm } from "@fastform/types/forms";
import ThankYouCard from "./ThankYouCard";

interface PreviewFormProps {
  localform?: TForm;
  setActiveQuestionId: (id: string | null) => void;
  activeQuestionId?: string | null;
  questions: TFormQuestion[];
  brandColor: string;
}

export default function PreviewForm({
  localform,
  setActiveQuestionId,
  activeQuestionId,
  questions,
  brandColor,
}: PreviewFormProps) {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const gotoNextQuestion = () => {
    const currentIndex = questions.findIndex((q) => q.id === activeQuestionId);
    if (currentIndex < questions.length - 1) {
      setActiveQuestionId(questions[currentIndex + 1].id);
    } else {
      if (localform?.thankYouCard?.enabled) {
        setActiveQuestionId("thank-you-card");
      } else {
        setIsModalOpen(false);
        setTimeout(() => {
          setActiveQuestionId(questions[0].id);
          setIsModalOpen(true);
        }, 500);
        if (localform?.thankYouCard?.enabled) {
          setActiveQuestionId("thank-you-card");
        } else {
          setIsModalOpen(false);
          setTimeout(() => {
            setActiveQuestionId(questions[0].id);
            setIsModalOpen(true);
          }, 500);
        }
      }
    }
  };

  const resetPreview = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setActiveQuestionId(questions[0].id);
      setIsModalOpen(true);
    }, 500);
  };

  if (!activeQuestionId) {
    return null;
  }

  return (
    <>
      <Modal isOpen={isModalOpen} reset={resetPreview}>
        {activeQuestionId == "thank-you-card" ? (
          <ThankYouCard
            brandColor={brandColor}
            headline={localform?.thankYouCard?.headline || ""}
            subheader={localform?.thankYouCard?.subheader || ""}
          />
        ) : (
          questions.map(
            (question, idx) =>
              activeQuestionId === question.id && (
                <QuestionConditional
                  key={question.id}
                  question={question}
                  brandColor={brandColor}
                  lastQuestion={idx === questions.length - 1}
                  onSubmit={gotoNextQuestion}
                />
              )
          )
        )}
      </Modal>
    </>
  );
}
