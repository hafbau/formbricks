"use client";

import AdvancedSettings from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/components/AdvancedSettings";
import { getTFormQuestionTypeName } from "@/app/lib/questions";
import { cn } from "@fastform/lib/cn";
import { TFormQuestionType } from "@fastform/types/forms";
import { TForm } from "@fastform/types/forms";
import { Input } from "@fastform/ui/Input";
import { Label } from "@fastform/ui/Label";
import { Switch } from "@fastform/ui/Switch";
import {
  ChatBubbleBottomCenterTextIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CursorArrowRippleIcon,
  ListBulletIcon,
  PresentationChartBarIcon,
  QueueListIcon,
  StarIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
} from "@heroicons/react/24/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import FileUploadQuestionForm from "./FileUploadQuestionForm";
import CTAQuestionForm from "./CTAQuestionForm";
import ConsentQuestionForm from "./ConsentQuestionForm";
import MultipleChoiceMultiForm from "./MultipleChoiceMultiForm";
import MultipleChoiceSingleForm from "./MultipleChoiceSingleForm";
import NPSQuestionForm from "./NPSQuestionForm";
import OpenQuestionForm from "./OpenQuestionForm";
import QuestionDropdown from "./QuestionMenu";
import RatingQuestionForm from "./RatingQuestionForm";
import PictureSelectionForm from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/components/PictureSelectionForm";
import { TProduct } from "@fastform/types/product";

interface QuestionCardProps {
  localform: TForm;
  product?: TProduct;
  questionIdx: number;
  moveQuestion: (questionIndex: number, up: boolean) => void;
  updateQuestion: (questionIdx: number, updatedAttributes: any) => void;
  deleteQuestion: (questionIdx: number) => void;
  duplicateQuestion: (questionIdx: number) => void;
  activeQuestionId: string | null;
  setActiveQuestionId: (questionId: string | null) => void;
  lastQuestion: boolean;
  isInValid: boolean;
}

export function BackButtonInput({
  value,
  onChange,
  className,
}: {
  value: string | undefined;
  onChange: (e: any) => void;
  className?: string;
}) {
  return (
    <div className="w-full">
      <Label htmlFor="backButtonLabel">&quot;Back&quot; Button Label</Label>
      <div className="mt-2">
        <Input
          id="backButtonLabel"
          name="backButtonLabel"
          value={value}
          placeholder="Back"
          onChange={onChange}
          className={className}
        />
      </div>
    </div>
  );
}

export default function QuestionCard({
  localform,
  product,
  questionIdx,
  moveQuestion,
  updateQuestion,
  duplicateQuestion,
  deleteQuestion,
  activeQuestionId,
  setActiveQuestionId,
  lastQuestion,
  isInValid,
}: QuestionCardProps) {
  const question = localform.questions[questionIdx];
  const open = activeQuestionId === question.id;
  const [openAdvanced, setOpenAdvanced] = useState(question.logic && question.logic.length > 0);

  return (
    <Draggable draggableId={question.id} index={questionIdx}>
      {(provided) => (
        <div
          className={cn(
            open ? "scale-100 shadow-lg" : "scale-97 shadow-md",
            "flex flex-row rounded-lg bg-white transition-all duration-300 ease-in-out"
          )}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <div
            className={cn(
              open ? "bg-slate-700" : "bg-slate-400",
              "top-0 w-10 rounded-l-lg p-2 text-center text-sm text-white hover:bg-slate-600",
              isInValid && "bg-red-400  hover:bg-red-600"
            )}>
            {questionIdx + 1}
          </div>
          <Collapsible.Root
            open={open}
            onOpenChange={() => {
              if (activeQuestionId !== question.id) {
                setActiveQuestionId(question.id);
              } else {
                setActiveQuestionId(null);
              }
            }}
            className="flex-1 rounded-r-lg border border-slate-200">
            <Collapsible.CollapsibleTrigger
              asChild
              className={cn(open ? "" : "  ", "flex cursor-pointer justify-between p-4 hover:bg-slate-50")}>
              <div>
                <div className="inline-flex">
                  <div className="-ml-0.5 mr-3 h-6 w-6 text-slate-400">
                    {question.type === TFormQuestionType.FileUpload ? (
                      <ArrowUpTrayIcon />
                    ) : question.type === TFormQuestionType.OpenText ? (
                      <ChatBubbleBottomCenterTextIcon />
                    ) : question.type === TFormQuestionType.MultipleChoiceSingle ? (
                      <QueueListIcon />
                    ) : question.type === TFormQuestionType.MultipleChoiceMulti ? (
                      <ListBulletIcon />
                    ) : question.type === TFormQuestionType.NPS ? (
                      <PresentationChartBarIcon />
                    ) : question.type === TFormQuestionType.CTA ? (
                      <CursorArrowRippleIcon />
                    ) : question.type === TFormQuestionType.Rating ? (
                      <StarIcon />
                    ) : question.type === TFormQuestionType.Consent ? (
                      <CheckIcon />
                    ) : question.type === TFormQuestionType.PictureSelection ? (
                      <PhotoIcon />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {question.headline || getTFormQuestionTypeName(question.type)}
                    </p>
                    {!open && question?.required && (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {question?.required && "Required"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <QuestionDropdown
                    questionIdx={questionIdx}
                    lastQuestion={lastQuestion}
                    duplicateQuestion={duplicateQuestion}
                    deleteQuestion={deleteQuestion}
                    moveQuestion={moveQuestion}
                  />
                </div>
              </div>
            </Collapsible.CollapsibleTrigger>
            <Collapsible.CollapsibleContent className="px-4 pb-4">
              {question.type === TFormQuestionType.OpenText ? (
                <OpenQuestionForm
                  localform={localform}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  isInValid={isInValid}
                />
              ) : question.type === TFormQuestionType.MultipleChoiceSingle ? (
                <MultipleChoiceSingleForm
                  localform={localform}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  isInValid={isInValid}
                />
              ) : question.type === TFormQuestionType.MultipleChoiceMulti ? (
                <MultipleChoiceMultiForm
                  localform={localform}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  isInValid={isInValid}
                />
              ) : question.type === TFormQuestionType.NPS ? (
                <NPSQuestionForm
                  localform={localform}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  isInValid={isInValid}
                />
              ) : question.type === TFormQuestionType.CTA ? (
                <CTAQuestionForm
                  localform={localform}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  isInValid={isInValid}
                />
              ) : question.type === TFormQuestionType.Rating ? (
                <RatingQuestionForm
                  localform={localform}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  isInValid={isInValid}
                />
              ) : question.type === TFormQuestionType.Consent ? (
                <ConsentQuestionForm
                  localform={localform}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  isInValid={isInValid}
                />
              ) : question.type === TFormQuestionType.PictureSelection ? (
                <PictureSelectionForm
                  localform={localform}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  isInValid={isInValid}
                />
              ) : question.type === TFormQuestionType.FileUpload ? (
                <FileUploadQuestionForm
                  localform={localform}
                  product={product}
                  question={question}
                  questionIdx={questionIdx}
                  updateQuestion={updateQuestion}
                  lastQuestion={lastQuestion}
                  isInValid={isInValid}
                />
              ) : null}
              <div className="mt-4">
                <Collapsible.Root open={openAdvanced} onOpenChange={setOpenAdvanced} className="mt-5">
                  <Collapsible.CollapsibleTrigger className="flex items-center text-sm text-slate-700">
                    {openAdvanced ? (
                      <ChevronDownIcon className="mr-1 h-4 w-3" />
                    ) : (
                      <ChevronRightIcon className="mr-2 h-4 w-3" />
                    )}
                    {openAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
                  </Collapsible.CollapsibleTrigger>

                  <Collapsible.CollapsibleContent className="space-y-4">
                    {question.type !== TFormQuestionType.NPS &&
                    question.type !== TFormQuestionType.Rating &&
                    question.type !== TFormQuestionType.CTA ? (
                      <div className="mt-4 flex space-x-2">
                        <div className="w-full">
                          <Label htmlFor="buttonLabel">Button Label</Label>
                          <div className="mt-2">
                            <Input
                              id="buttonLabel"
                              name="buttonLabel"
                              value={question.buttonLabel}
                              maxLength={48}
                              placeholder={lastQuestion ? "Finish" : "Next"}
                              onChange={(e) => {
                                if (e.target.value.trim() == "") e.target.value = "";
                                updateQuestion(questionIdx, { buttonLabel: e.target.value });
                              }}
                            />
                          </div>
                        </div>
                        {questionIdx !== 0 && (
                          <BackButtonInput
                            value={question.backButtonLabel}
                            onChange={(e) => {
                              if (e.target.value.trim() == "") e.target.value = "";
                              updateQuestion(questionIdx, { backButtonLabel: e.target.value });
                            }}
                          />
                        )}
                      </div>
                    ) : null}
                    {(question.type === TFormQuestionType.Rating ||
                      question.type === TFormQuestionType.NPS) &&
                      questionIdx !== 0 && (
                        <div className="mt-4">
                          <BackButtonInput
                            value={question.backButtonLabel}
                            onChange={(e) => {
                              if (e.target.value.trim() == "") e.target.value = "";
                              updateQuestion(questionIdx, { backButtonLabel: e.target.value });
                            }}
                          />
                        </div>
                      )}

                    <AdvancedSettings
                      question={question}
                      questionIdx={questionIdx}
                      localform={localform}
                      updateQuestion={updateQuestion}
                    />
                  </Collapsible.CollapsibleContent>
                </Collapsible.Root>
              </div>
            </Collapsible.CollapsibleContent>

            {open && (
              <div className="mx-4 flex justify-end space-x-6 border-t border-slate-200">
                {question.type === "openText" && (
                  <div className="my-4 flex items-center justify-end space-x-2">
                    <Label htmlFor="longAnswer">Long Answer</Label>
                    <Switch
                      id="longAnswer"
                      checked={question.longAnswer !== false}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(questionIdx, {
                          longAnswer:
                            typeof question.longAnswer === "undefined" ? false : !question.longAnswer,
                        });
                      }}
                    />
                  </div>
                )}
                {
                  <div className="my-4 flex items-center justify-end space-x-2">
                    <Label htmlFor="required-toggle">Required</Label>
                    <Switch
                      id="required-toggle"
                      checked={question.required}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuestion(questionIdx, { required: !question.required });
                      }}
                    />
                  </div>
                }
              </div>
            )}
          </Collapsible.Root>
        </div>
      )}
    </Draggable>
  );
}
