import { createOrUpdateIntegrationAction } from "@/app/(app)/environments/[environmentId]/integrations/actions";
import {
  TIntegrationGoogleSheets,
  TIntegrationGoogleSheetsConfigData,
  TIntegrationGoogleSheetsInput,
} from "@fastform/types/integration/googleSheet";
import { TForm } from "@fastform/types/forms";
import { Button } from "@fastform/ui/Button";
import { Checkbox } from "@fastform/ui/Checkbox";
import { Label } from "@fastform/ui/Label";
import { Modal } from "@fastform/ui/Modal";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import GoogleSheetLogo from "../images/google-sheets-small.png";
import { TIntegrationItem } from "@fastform/types/integration";

interface AddWebhookModalProps {
  environmentId: string;
  open: boolean;
  forms: TForm[];
  setOpen: (v: boolean) => void;
  spreadsheets: TIntegrationItem[];
  googleSheetIntegration: TIntegrationGoogleSheets;
  selectedIntegration?: (TIntegrationGoogleSheetsConfigData & { index: number }) | null;
}

export default function AddIntegrationModal({
  environmentId,
  forms,
  open,
  setOpen,
  spreadsheets,
  googleSheetIntegration,
  selectedIntegration,
}: AddWebhookModalProps) {
  const { handleSubmit } = useForm();

  const integrationData = {
    spreadsheetId: "",
    spreadsheetName: "",
    formId: "",
    formName: "",
    questionIds: [""],
    questions: "",
    createdAt: new Date(),
  };

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isLinkingSheet, setIsLinkingSheet] = useState(false);
  const [selectedform, setSelectedform] = useState<TForm | null>(null);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<any>(null);
  const existingIntegrationData = googleSheetIntegration?.config?.data;
  const googleSheetIntegrationData: TIntegrationGoogleSheetsInput = {
    type: "googleSheets",
    config: {
      key: googleSheetIntegration?.config?.key,
      email: googleSheetIntegration.config.email,
      data: existingIntegrationData || [],
    },
  };

  useEffect(() => {
    if (selectedform) {
      const questionIds = selectedform.questions.map((question) => question.id);
      if (!selectedIntegration) {
        setSelectedQuestions(questionIds);
      }
    }
  }, [selectedIntegration, selectedform]);

  useEffect(() => {
    if (selectedIntegration) {
      setSelectedSpreadsheet({
        id: selectedIntegration.spreadsheetId,
        name: selectedIntegration.spreadsheetName,
      });
      setSelectedform(
        forms.find((form) => {
          return form.id === selectedIntegration.formId;
        })!
      );
      setSelectedQuestions(selectedIntegration.questionIds);
      return;
    }
    resetForm();
  }, [selectedIntegration, forms]);

  const linkSheet = async () => {
    try {
      if (!selectedSpreadsheet) {
        throw new Error("Please select a spreadsheet");
      }
      if (!selectedform) {
        throw new Error("Please select a form");
      }

      if (selectedQuestions.length === 0) {
        throw new Error("Please select at least one question");
      }
      setIsLinkingSheet(true);
      integrationData.spreadsheetId = selectedSpreadsheet.id;
      integrationData.spreadsheetName = selectedSpreadsheet.name;
      integrationData.formId = selectedform.id;
      integrationData.formName = selectedform.name;
      integrationData.questionIds = selectedQuestions;
      integrationData.questions =
        selectedQuestions.length === selectedform?.questions.length
          ? "All questions"
          : "Selected questions";
      integrationData.createdAt = new Date();
      if (selectedIntegration) {
        // update action
        googleSheetIntegrationData.config!.data[selectedIntegration.index] = integrationData;
      } else {
        // create action
        googleSheetIntegrationData.config!.data.push(integrationData);
      }
      await createOrUpdateIntegrationAction(environmentId, googleSheetIntegrationData);
      toast.success(`Integration ${selectedIntegration ? "updated" : "added"} successfully`);
      resetForm();
      setOpen(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsLinkingSheet(false);
    }
  };

  const handleCheckboxChange = (questionId: string) => {
    setSelectedQuestions((prevValues) =>
      prevValues.includes(questionId)
        ? prevValues.filter((value) => value !== questionId)
        : [...prevValues, questionId]
    );
  };

  const setOpenWithStates = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const resetForm = () => {
    setIsLinkingSheet(false);
    setSelectedSpreadsheet("");
    setSelectedform(null);
  };

  const deleteLink = async () => {
    googleSheetIntegrationData.config!.data.splice(selectedIntegration!.index, 1);
    try {
      setIsDeleting(true);
      await createOrUpdateIntegrationAction(environmentId, googleSheetIntegrationData);
      toast.success("Integration removed successfully");
      setOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasMatchingId = googleSheetIntegration.config.data.some((configData) => {
    if (!selectedSpreadsheet) {
      return false;
    }
    return configData.spreadsheetId === selectedSpreadsheet.id;
  });

  const DropdownSelector = ({ label, items, selectedItem, setSelectedItem, disabled }) => {
    return (
      <div className="col-span-1">
        <Label htmlFor={label}>{label}</Label>
        <div className="mt-1 flex">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                disabled={disabled ? disabled : false}
                type="button"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-500 dark:text-slate-300">
                <span className="flex flex-1">
                  <span>{selectedItem ? selectedItem.name : `${label}`}</span>
                </span>
                <span className="flex h-full items-center border-l pl-3">
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                </span>
              </button>
            </DropdownMenu.Trigger>

            {!disabled && (
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[220px] rounded-md bg-white text-sm text-slate-800 shadow-md"
                  align="start">
                  {items &&
                    items.map((item) => (
                      <DropdownMenu.Item
                        key={item.id}
                        className="flex cursor-pointer items-center p-3 hover:bg-gray-100 hover:outline-none data-[disabled]:cursor-default data-[disabled]:opacity-50"
                        onSelect={() => setSelectedItem(item)}>
                        {item.name}
                      </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            )}
          </DropdownMenu.Root>
        </div>
      </div>
    );
  };

  return (
    <Modal open={open} setOpen={setOpenWithStates} noPadding closeOnOutsideClick={false}>
      <div className="flex h-full flex-col rounded-lg">
        <div className="rounded-t-lg bg-slate-100">
          <div className="flex w-full items-center justify-between p-6">
            <div className="flex items-center space-x-2">
              <div className="mr-1.5 h-6 w-6 text-slate-500">
                <Image className="w-12" src={GoogleSheetLogo} alt="Google Sheet logo" />
              </div>
              <div>
                <div className="text-xl font-medium text-slate-700">Link Google Sheet</div>
                <div className="text-sm text-slate-500">Sync responses with a Google Sheet</div>
              </div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(linkSheet)}>
          <div className="flex justify-between rounded-lg p-6">
            <div className="w-full space-y-4">
              <div>
                <div className="mb-4">
                  <DropdownSelector
                    label="Select Spreadsheet"
                    items={spreadsheets}
                    selectedItem={selectedSpreadsheet}
                    setSelectedItem={setSelectedSpreadsheet}
                    disabled={spreadsheets.length === 0}
                  />
                  {selectedSpreadsheet && hasMatchingId && (
                    <p className="text-xs text-amber-700">
                      <strong>Warning:</strong> You have already connected one form with this sheet. Your data
                      will be inconsistent
                    </p>
                  )}
                  <p className="m-1 text-xs text-slate-500">
                    {spreadsheets.length === 0 &&
                      "You have to create at least one spreadshseet to be able to setup this integration"}
                  </p>
                </div>
                <div>
                  <DropdownSelector
                    label="Select Form"
                    items={forms}
                    selectedItem={selectedform}
                    setSelectedItem={setSelectedform}
                    disabled={forms.length === 0}
                  />
                  <p className="m-1 text-xs text-slate-500">
                    {forms.length === 0 && "You have to create a form to be able to setup this integration"}
                  </p>
                </div>
              </div>
              {selectedform && (
                <div>
                  <Label htmlFor="forms">Questions</Label>
                  <div className="mt-1 rounded-lg border border-slate-200">
                    <div className="grid content-center rounded-lg bg-slate-50 p-3 text-left text-sm text-slate-900">
                      {selectedform?.questions.map((question) => (
                        <div key={question.id} className="my-1 flex items-center space-x-2">
                          <label htmlFor={question.id} className="flex cursor-pointer items-center">
                            <Checkbox
                              type="button"
                              id={question.id}
                              value={question.id}
                              className="bg-white"
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={() => {
                                handleCheckboxChange(question.id);
                              }}
                            />
                            <span className="ml-2">{question.headline}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end border-t border-slate-200 p-6">
            <div className="flex space-x-2">
              {selectedIntegration ? (
                <Button
                  type="button"
                  variant="warn"
                  loading={isDeleting}
                  onClick={() => {
                    deleteLink();
                  }}>
                  Delete
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="minimal"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}>
                  Cancel
                </Button>
              )}
              <Button variant="darkCTA" type="submit" loading={isLinkingSheet}>
                {selectedIntegration ? "Update" : "Link Sheet"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
