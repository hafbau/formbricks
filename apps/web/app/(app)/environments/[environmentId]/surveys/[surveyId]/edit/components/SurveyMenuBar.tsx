"use client";

import AlertDialog from "@fastform/ui/AlertDialog";
import { DeleteDialog } from "@fastform/ui/DeleteDialog";
import { TSurveyQuestionType } from "@fastform/types/surveys";
import { TEnvironment } from "@fastform/types/environment";
import { TProduct } from "@fastform/types/product";
import { TSurvey } from "@fastform/types/surveys";
import { Button } from "@fastform/ui/Button";
import { Input } from "@fastform/ui/Input";
import { ArrowLeftIcon, Cog8ToothIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { isEqual } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { validateQuestion } from "./Validation";
import { deleteSurveyAction, updateSurveyAction } from "../actions";
import SurveyStatusDropdown from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/components/SurveyStatusDropdown";

interface SurveyMenuBarProps {
  localSurvey: TSurvey;
  form: TSurvey;
  setLocalSurvey: (form: TSurvey) => void;
  environment: TEnvironment;
  activeId: "questions" | "settings";
  setActiveId: (id: "questions" | "settings") => void;
  setInvalidQuestions: (invalidQuestions: String[]) => void;
  product: TProduct;
  responseCount: number;
}

export default function SurveyMenuBar({
  localSurvey,
  form,
  environment,
  setLocalSurvey,
  activeId,
  setActiveId,
  setInvalidQuestions,
  product,
  responseCount,
}: SurveyMenuBarProps) {
  const router = useRouter();
  const [audiencePrompt, setAudiencePrompt] = useState(true);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isSurveyPublishing, setIsSurveyPublishing] = useState(false);
  const [isSurveySaving, setIsSurveySaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  let faultyQuestions: String[] = [];

  useEffect(() => {
    if (audiencePrompt && activeId === "settings") {
      setAudiencePrompt(false);
    }
  }, [activeId, audiencePrompt]);

  useEffect(() => {
    const warningText = "You have unsaved changes - are you sure you wish to leave this page?";
    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!isEqual(localSurvey, form)) {
        e.preventDefault();
        return (e.returnValue = warningText);
      }
    };

    window.addEventListener("beforeunload", handleWindowClose);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [localSurvey, form]);

  // write a function which updates the local form status
  const updateLocalSurveyStatus = (status: TSurvey["status"]) => {
    const updatedSurvey = { ...localSurvey };
    updatedSurvey.status = status;
    setLocalSurvey(updatedSurvey);
  };

  const deleteSurvey = async (surveyId) => {
    try {
      await deleteSurveyAction(surveyId);
      router.refresh();
      setDeleteDialogOpen(false);
      router.back();
    } catch (error) {
      console.log("An error occurred deleting the form");
    }
  };

  const handleBack = () => {
    const createdAt = new Date(localSurvey.createdAt).getTime();
    const updatedAt = new Date(localSurvey.updatedAt).getTime();

    if (createdAt === updatedAt && localSurvey.status === "draft") {
      setDeleteDialogOpen(true);
    } else if (!isEqual(localSurvey, form)) {
      setConfirmDialogOpen(true);
    } else {
      router.back();
    }
  };

  const validateSurvey = (form) => {
    const existingQuestionIds = new Set();

    if (form.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    let pin = form?.pin;
    if (pin !== null && pin.toString().length !== 4) {
      toast.error("PIN must be a four digit number.");
      return;
    }

    faultyQuestions = [];
    for (let index = 0; index < form.questions.length; index++) {
      const question = form.questions[index];
      const isValid = validateQuestion(question);

      if (!isValid) {
        faultyQuestions.push(question.id);
      }
    }
    // if there are any faulty questions, the user won't be allowed to save the form
    if (faultyQuestions.length > 0) {
      setInvalidQuestions(faultyQuestions);
      toast.error("Please fill all required fields.");
      return false;
    }

    for (const question of form.questions) {
      const existingLogicConditions = new Set();

      if (existingQuestionIds.has(question.id)) {
        toast.error("There are 2 identical question IDs. Please update one.");
        return false;
      }
      existingQuestionIds.add(question.id);

      if (
        question.type === TSurveyQuestionType.MultipleChoiceSingle ||
        question.type === TSurveyQuestionType.MultipleChoiceMulti
      ) {
        const haveSameChoices =
          question.choices.some((element) => element.label.trim() === "") ||
          question.choices.some((element, index) =>
            question.choices
              .slice(index + 1)
              .some((nextElement) => nextElement.label.trim() === element.label.trim())
          );

        if (haveSameChoices) {
          toast.error("You have two identical choices.");
          return false;
        }
      }

      for (const logic of question.logic || []) {
        const validFields = ["condition", "destination", "value"].filter(
          (field) => logic[field] !== undefined
        ).length;

        if (validFields < 2) {
          setInvalidQuestions([question.id]);
          toast.error("Incomplete logic jumps detected: Please fill or delete them.");
          return false;
        }

        if (question.required && logic.condition === "skipped") {
          toast.error("You have a missing logic condition. Please update or delete it.");
          return false;
        }

        const thisLogic = `${logic.condition}-${logic.value}`;
        if (existingLogicConditions.has(thisLogic)) {
          setInvalidQuestions([question.id]);
          toast.error("You have 2 competing logic conditons. Please update or delete one.");
          return false;
        }
        existingLogicConditions.add(thisLogic);
      }
    }

    if (form.redirectUrl && !form.redirectUrl.includes("https://") && !form.redirectUrl.includes("http://")) {
      toast.error("Please enter a valid URL for redirecting respondents.");
      return false;
    }

    /*
     Check whether the count for autocomplete responses is not less 
     than the current count of accepted response and also it is not set to 0
    */
    if (
      (form.autoComplete && form._count?.responses && form._count.responses >= form.autoComplete) ||
      form?.autoComplete === 0
    ) {
      return false;
    }

    return true;
  };

  const saveSurveyAction = async (shouldNavigateBack = false) => {
    if (localSurvey.questions.length === 0) {
      toast.error("Please add at least one question.");
      return;
    }
    setIsSurveySaving(true);
    // Create a copy of localSurvey with isDraft removed from every question
    const strippedSurvey: TSurvey = {
      ...localSurvey,
      questions: localSurvey.questions.map((question) => {
        const { isDraft, ...rest } = question;
        return rest;
      }),
      attributeFilters: localSurvey.attributeFilters.filter((attributeFilter) => {
        if (attributeFilter.attributeClassId && attributeFilter.value) {
          return true;
        }
      }),
    };

    if (!validateSurvey(localSurvey)) {
      setIsSurveySaving(false);
      return;
    }

    try {
      await updateSurveyAction({ ...strippedSurvey });
      router.refresh();
      setIsSurveySaving(false);
      toast.success("Changes saved.");
      if (shouldNavigateBack) {
        router.back();
      } else {
        if (localSurvey.status !== "draft") {
          router.push(`/environments/${environment.id}/surveys/${localSurvey.id}/summary`);
        } else {
          router.push(`/environments/${environment.id}/surveys`);
        }
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      setIsSurveySaving(false);
      toast.error(`Error saving changes`);
      return;
    }
  };

  function containsEmptyTriggers() {
    return (
      localSurvey.type === "web" &&
      localSurvey.triggers &&
      (localSurvey.triggers[0] === "" || localSurvey.triggers.length === 0)
    );
  }

  return (
    <>
      {environment?.type === "development" && (
        <nav className="top-0 z-10 w-full border-b border-slate-200 bg-white">
          <div className="h-6 w-full bg-[#A33700] p-0.5 text-center text-sm text-white">
            You&apos;re in development mode. Use it to test surveys, actions and attributes.
          </div>
        </nav>
      )}
      <div className="border-b border-slate-200 bg-white px-5 py-3 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-2 whitespace-nowrap">
          <Button
            variant="secondary"
            StartIcon={ArrowLeftIcon}
            onClick={() => {
              handleBack();
            }}>
            Back
          </Button>
          <p className="hidden pl-4 font-semibold md:block">{product.name} / </p>
          <Input
            defaultValue={localSurvey.name}
            onChange={(e) => {
              const updatedSurvey = { ...localSurvey, name: e.target.value };
              setLocalSurvey(updatedSurvey);
            }}
            className="w-72 border-white hover:border-slate-200 "
          />
        </div>
        {responseCount > 0 && (
          <div className="mx-auto flex items-center rounded-full border border-amber-200 bg-amber-100 p-2 text-amber-700 shadow-sm">
            <ExclamationTriangleIcon className=" h-5 w-5 text-amber-400" />
            <p className=" pl-1 text-xs lg:text-sm">
              This form received responses, make changes with caution.
            </p>
          </div>
        )}
        <div className="mt-3 flex sm:ml-4 sm:mt-0">
          <div className="mr-4 flex items-center">
            <SurveyStatusDropdown
              form={form}
              environment={environment}
              updateLocalSurveyStatus={updateLocalSurveyStatus}
            />
          </div>
          <Button
            disabled={isSurveyPublishing || containsEmptyTriggers()}
            variant={localSurvey.status === "draft" ? "secondary" : "darkCTA"}
            className="mr-3"
            loading={isSurveySaving}
            onClick={() => saveSurveyAction()}>
            Save
          </Button>
          {localSurvey.status === "draft" && audiencePrompt && (
            <Button
              variant="darkCTA"
              onClick={() => {
                setAudiencePrompt(false);
                setActiveId("settings");
              }}
              EndIcon={Cog8ToothIcon}>
              Continue to Settings
            </Button>
          )}
          {localSurvey.status === "draft" && !audiencePrompt && (
            <Button
              disabled={isSurveySaving || containsEmptyTriggers()}
              variant="darkCTA"
              loading={isSurveyPublishing}
              onClick={async () => {
                setIsSurveyPublishing(true);
                if (!validateSurvey(localSurvey)) {
                  setIsSurveyPublishing(false);
                  return;
                }
                await updateSurveyAction({ ...localSurvey, status: "inProgress" });
                router.push(`/environments/${environment.id}/surveys/${localSurvey.id}/summary?success=true`);
              }}>
              Publish
            </Button>
          )}
        </div>
        <DeleteDialog
          deleteWhat="Draft"
          open={isDeleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          onDelete={async () => {
            setIsDeleting(true);
            await deleteSurvey(localSurvey.id);
            setIsDeleting(false);
          }}
          text="Do you want to delete this draft?"
          isDeleting={isDeleting}
          isSaving={isSaving}
          useSaveInsteadOfCancel={true}
          onSave={async () => {
            setIsSaving(true);
            await saveSurveyAction(true);
            setIsSaving(false);
          }}
        />
        <AlertDialog
          confirmWhat="Form changes"
          open={isConfirmDialogOpen}
          setOpen={setConfirmDialogOpen}
          onDiscard={() => {
            setConfirmDialogOpen(false);
            router.back();
          }}
          text="You have unsaved changes in your form. Would you like to save them before leaving?"
          confirmButtonLabel="Save"
          onSave={() => saveSurveyAction(true)}
        />
      </div>
    </>
  );
}
