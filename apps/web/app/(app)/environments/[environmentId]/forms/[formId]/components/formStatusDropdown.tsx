"use client";

import { updateformAction } from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/actions";
import { FormStatusIndicator } from "@fastform/ui/FormStatusIndicator";
import { TEnvironment } from "@fastform/types/environment";
import { Tform } from "@fastform/types/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fastform/ui/Select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@fastform/ui/Tooltip";
import { CheckCircleIcon, PauseCircleIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

export default function FormStatusDropdown({
  environment,
  updateLocalFormStatus,
  form,
}: {
  environment: TEnvironment;
  updateLocalFormStatus?: (status: "draft" | "inProgress" | "paused" | "completed" | "archived") => void;
  form: Tform;
}) {
  const isCloseOnDateEnabled = form.closeOnDate !== null;
  const closeOnDate = form.closeOnDate ? new Date(form.closeOnDate) : null;
  const isStatusChangeDisabled = (isCloseOnDateEnabled && closeOnDate && closeOnDate < new Date()) ?? false;

  return (
    <>
      {form.status === "draft" ? (
        <div className="flex items-center">
          {(form.type === "link" || environment.widgetSetupCompleted) && (
            <FormStatusIndicator status={form.status} />
          )}
          {form.status === "draft" && <p className="text-sm italic text-slate-600">Draft</p>}
        </div>
      ) : (
        <Select
          value={form.status}
          disabled={isStatusChangeDisabled}
          onValueChange={(value) => {
            const castedValue = value as "draft" | "inProgress" | "paused" | "completed";
            updateformAction({ ...form, status: castedValue })
              .then(() => {
                toast.success(
                  value === "inProgress"
                    ? "Form live"
                    : value === "paused"
                    ? "Form paused"
                    : value === "completed"
                    ? "Form completed"
                    : ""
                );
              })
              .catch((error) => {
                toast.error(`Error: ${error.message}`);
              });

            if (updateLocalFormStatus)
              updateLocalFormStatus(value as "draft" | "inProgress" | "paused" | "completed" | "archived");
          }}>
          <TooltipProvider delayDuration={50}>
            <Tooltip open={isStatusChangeDisabled ? undefined : false}>
              <TooltipTrigger asChild>
                <SelectTrigger className="w-[170px] bg-white py-6 md:w-[200px]">
                  <SelectValue>
                    <div className="flex items-center">
                      {(form.type === "link" || environment.widgetSetupCompleted) && (
                        <FormStatusIndicator status={form.status} />
                      )}
                      <span className="ml-2 text-sm text-slate-700">
                        {form.status === "inProgress" && "In-progress"}
                        {form.status === "paused" && "Paused"}
                        {form.status === "completed" && "Completed"}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
              </TooltipTrigger>
              <SelectContent className="bg-white">
                <SelectItem className="group  font-normal hover:text-slate-900" value="inProgress">
                  <PlayCircleIcon className="-mt-1 mr-1 inline h-5 w-5 text-slate-500 group-hover:text-slate-800" />
                  In-progress
                </SelectItem>
                <SelectItem className="group  font-normal hover:text-slate-900" value="paused">
                  <PauseCircleIcon className="-mt-1 mr-1 inline h-5 w-5 text-slate-500 group-hover:text-slate-800" />
                  Paused
                </SelectItem>
                <SelectItem className="group  font-normal hover:text-slate-900" value="completed">
                  <CheckCircleIcon className="-mt-1 mr-1 inline h-5 w-5 text-slate-500 group-hover:text-slate-800" />
                  Completed
                </SelectItem>
              </SelectContent>

              <TooltipContent>
                To update the form status, update the &ldquo;Close
                <br /> form on date&rdquo; setting in the Response Options.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Select>
      )}
    </>
  );
}
