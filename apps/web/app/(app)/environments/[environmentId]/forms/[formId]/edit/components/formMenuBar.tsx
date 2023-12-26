"use client";

import AlertDialog from "@fastform/ui/AlertDialog";
import { DeleteDialog } from "@fastform/ui/DeleteDialog";
import { TformQuestionType } from "@fastform/types/forms";
import { TEnvironment } from "@fastform/types/environment";
import { TProduct } from "@fastform/types/product";
import { Tform } from "@fastform/types/forms";
import { Button } from "@fastform/ui/Button";
import { Input } from "@fastform/ui/Input";
import { ArrowLeftIcon, Cog8ToothIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { isEqual } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { validateQuestion } from "./Validation";
import { deleteformAction, updateformAction } from "../actions";
import FormStatusDropdown from "@/app/(app)/environments/[environmentId]/forms/[formId]/components/FormStatusDropdown";

interface formMenuBarProps {
  localform: Tform;
  form: Tform;
  setLocalform: (form: Tform) => void;
  environment: TEnvironment;
  activeId: "questions" | "settings";
  setActiveId: (id: "questions" | "settings") => void;
  setInvalidQuestions: (invalidQuestions: String[]) => void;
  product: TProduct;
  responseCount: number;
}

export default function FormMenuBar({
  localform,
  form,
  environment,
  setLocalform,
  activeId,
  setActiveId,
  setInvalidQuestions,
  product,
  responseCount,
}: formMenuBarProps) {
  const router = useRouter();
  const [audiencePrompt, setAudiencePrompt] = useState(true);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isformPublishing, setIsformPublishing] = useState(false);
  const [isformSaving, setIsformSaving] = useState(false);
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
      if (!isEqual(localform, form)) {
        e.preventDefault();
        return (e.returnValue = warningText);
      }
    };

    window.addEventListener("beforeunload", handleWindowClose);
    return () => {
      window.removeEventListener("beforeunload", handleWindowClose);
    };
  }, [localform, form]);

  // write a function which updates the local form status
  const updateLocalFormStatus = (status: Tform["status"]) => {
    const updatedform = { ...localform };
    updatedform.status = status;
    setLocalform(updatedform);
  };

  const deleteform = async (formId) => {
    try {
      await deleteformAction(formId);
      router.refresh();
      setDeleteDialogOpen(false);
      router.back();
    } catch (error) {
      console.log("An error occurred deleting the form");
    }
  };

  const handleBack = () => {
    const createdAt = new Date(localform.createdAt).getTime();
    const updatedAt = new Date(localform.updatedAt).getTime();

    if (createdAt === updatedAt && localform.status === "draft") {
      setDeleteDialogOpen(true);
    } else if (!isEqual(localform, form)) {
      setConfirmDialogOpen(true);
    } else {
      router.back();
    }
  };

  const validateform = (form) => {
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
        question.type === TformQuestionType.MultipleChoiceSingle ||
        question.type === TformQuestionType.MultipleChoiceMulti
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

  const saveformAction = async (shouldNavigateBack = false) => {
    if (localform.questions.length === 0) {
      toast.error("Please add at least one question.");
      return;
    }
    setIsformSaving(true);
    // Create a copy of localform with isDraft removed from every question
    const strippedform: Tform = {
      ...localform,
      questions: localform.questions.map((question) => {
        const { isDraft, ...rest } = question;
        return rest;
      }),
      attributeFilters: localform.attributeFilters.filter((attributeFilter) => {
        if (attributeFilter.attributeClassId && attributeFilter.value) {
          return true;
        }
      }),
    };

    if (!validateform(localform)) {
      setIsformSaving(false);
      return;
    }

    try {
      await updateformAction({ ...strippedform });
      router.refresh();
      setIsformSaving(false);
      toast.success("Changes saved.");
      if (shouldNavigateBack) {
        router.back();
      } else {
        if (localform.status !== "draft") {
          router.push(`/environments/${environment.id}/forms/${localform.id}/summary`);
        } else {
          router.push(`/environments/${environment.id}/forms`);
        }
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      setIsformSaving(false);
      toast.error(`Error saving changes`);
      return;
    }
  };

  function containsEmptyTriggers() {
    return (
      localform.type === "web" &&
      localform.triggers &&
      (localform.triggers[0] === "" || localform.triggers.length === 0)
    );
  }

  return (
    <>
      {environment?.type === "development" && (
        <nav className="top-0 z-10 w-full border-b border-slate-200 bg-white">
          <div className="h-6 w-full bg-[#A33700] p-0.5 text-center text-sm text-white">
            You&apos;re in development mode. Use it to test forms, actions and attributes.
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
            defaultValue={localform.name}
            onChange={(e) => {
              const updatedform = { ...localform, name: e.target.value };
              setLocalform(updatedform);
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
            <FormStatusDropdown
              form={form}
              environment={environment}
              updateLocalFormStatus={updateLocalFormStatus}
            />
          </div>
          <Button
            disabled={isformPublishing || containsEmptyTriggers()}
            variant={localform.status === "draft" ? "secondary" : "darkCTA"}
            className="mr-3"
            loading={isformSaving}
            onClick={() => saveformAction()}>
            Save
          </Button>
          {localform.status === "draft" && audiencePrompt && (
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
          {localform.status === "draft" && !audiencePrompt && (
            <Button
              disabled={isformSaving || containsEmptyTriggers()}
              variant="darkCTA"
              loading={isformPublishing}
              onClick={async () => {
                setIsformPublishing(true);
                if (!validateform(localform)) {
                  setIsformPublishing(false);
                  return;
                }
                await updateformAction({ ...localform, status: "inProgress" });
                router.push(`/environments/${environment.id}/forms/${localform.id}/summary?success=true`);
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
            await deleteform(localform.id);
            setIsDeleting(false);
          }}
          text="Do you want to delete this draft?"
          isDeleting={isDeleting}
          isSaving={isSaving}
          useSaveInsteadOfCancel={true}
          onSave={async () => {
            setIsSaving(true);
            await saveformAction(true);
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
          onSave={() => saveformAction(true)}
        />
      </div>
    </>
  );
}
