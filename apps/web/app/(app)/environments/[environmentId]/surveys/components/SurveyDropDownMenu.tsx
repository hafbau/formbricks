"use client";

import {
  copyToOtherEnvironmentAction,
  deleteSurveyAction,
  duplicateSurveyAction,
} from "@/app/(app)/environments/[environmentId]/actions";
import { DeleteDialog } from "@fastform/ui/DeleteDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@fastform/ui/DropdownMenu";
import LoadingSpinner from "@fastform/ui/LoadingSpinner";
import type { TEnvironment } from "@fastform/types/environment";
import type { TSurvey } from "@fastform/types/surveys";
import {
  ArrowUpOnSquareStackIcon,
  DocumentDuplicateIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  LinkIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

interface SurveyDropDownMenuProps {
  environmentId: string;
  form: TSurvey;
  environment: TEnvironment;
  otherEnvironment: TEnvironment;
  webAppUrl: string;
  singleUseId?: string;
  isSurveyCreationDeletionDisabled?: boolean;
}

export default function SurveyDropDownMenu({
  environmentId,
  form,
  environment,
  otherEnvironment,
  webAppUrl,
  singleUseId,
  isSurveyCreationDeletionDisabled,
}: SurveyDropDownMenuProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const surveyUrl = useMemo(() => webAppUrl + "/s/" + form.id, [form.id, webAppUrl]);

  const handleDeleteSurvey = async (form) => {
    setLoading(true);
    try {
      await deleteSurveyAction(form.id);
      router.refresh();
      setDeleteDialogOpen(false);
      toast.success("Form deleted successfully.");
    } catch (error) {
      toast.error("An error occured while deleting form");
    }
    setLoading(false);
  };

  const duplicateSurveyAndRefresh = async (surveyId) => {
    setLoading(true);
    try {
      await duplicateSurveyAction(environmentId, surveyId);
      router.refresh();
      toast.success("Form duplicated successfully.");
    } catch (error) {
      toast.error("Failed to duplicate the form.");
    }
    setLoading(false);
  };

  const copyToOtherEnvironment = async (surveyId) => {
    setLoading(true);
    try {
      await copyToOtherEnvironmentAction(environmentId, surveyId, otherEnvironment.id);
      if (otherEnvironment.type === "production") {
        toast.success("Form copied to production env.");
      } else if (otherEnvironment.type === "development") {
        toast.success("Form copied to development env.");
      }
      router.replace(`/environments/${otherEnvironment.id}`);
    } catch (error) {
      toast.error(`Failed to copy to ${otherEnvironment.type}`);
    }
    setLoading(false);
  };
  if (loading) {
    return (
      <div className="opacity-0.2 absolute left-0 top-0 h-full w-full bg-gray-100">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="z-10 cursor-pointer" asChild>
          <div>
            <span className="sr-only">Open options</span>
            <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          <DropdownMenuGroup>
            {!isSurveyCreationDeletionDisabled && (
              <>
                <DropdownMenuItem>
                  <Link
                    className="flex w-full items-center"
                    href={`/environments/${environmentId}/surveys/${form.id}/edit`}>
                    <PencilSquareIcon className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <button
                    className="flex w-full items-center"
                    onClick={async () => {
                      duplicateSurveyAndRefresh(form.id);
                    }}>
                    <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
                    Duplicate
                  </button>
                </DropdownMenuItem>
              </>
            )}
            {!isSurveyCreationDeletionDisabled && (
              <>
                {environment.type === "development" ? (
                  <DropdownMenuItem>
                    <button
                      className="flex w-full items-center"
                      onClick={() => {
                        copyToOtherEnvironment(form.id);
                      }}>
                      <ArrowUpOnSquareStackIcon className="mr-2 h-4 w-4" />
                      Copy to Prod
                    </button>
                  </DropdownMenuItem>
                ) : environment.type === "production" ? (
                  <DropdownMenuItem>
                    <button
                      className="flex w-full items-center"
                      onClick={() => {
                        copyToOtherEnvironment(form.id);
                      }}>
                      <ArrowUpOnSquareStackIcon className="mr-2 h-4 w-4" />
                      Copy to Dev
                    </button>
                  </DropdownMenuItem>
                ) : null}
              </>
            )}
            {form.type === "link" && form.status !== "draft" && (
              <>
                <DropdownMenuItem>
                  <Link
                    className="flex w-full items-center"
                    href={
                      singleUseId
                        ? `/s/${form.id}?suId=${singleUseId}&preview=true`
                        : `/s/${form.id}?preview=true`
                    }
                    target="_blank">
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Preview Form
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    className="flex w-full items-center"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        singleUseId ? `${surveyUrl}?suId=${singleUseId}` : surveyUrl
                      );
                      toast.success("Copied link to clipboard");
                      router.refresh();
                    }}>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy Link
                  </button>
                </DropdownMenuItem>
              </>
            )}
            {!isSurveyCreationDeletionDisabled && (
              <DropdownMenuItem>
                <button
                  className="flex w-full  items-center"
                  onClick={() => {
                    setDeleteDialogOpen(true);
                  }}>
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete
                </button>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {!isSurveyCreationDeletionDisabled && (
        <DeleteDialog
          deleteWhat="Form"
          open={isDeleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          onDelete={() => handleDeleteSurvey(form)}
          text="Are you sure you want to delete this form and all of its responses? This action cannot be undone."
        />
      )}
    </>
  );
}
