"use client";

import AddNoCodeActionModal from "@/app/(app)/environments/[environmentId]/(actionsAndAttributes)/actions/components/AddActionModal";
import { cn } from "@fastform/lib/cn";
import { TActionClass } from "@fastform/types/actionClasses";
import { TForm } from "@fastform/types/forms";
import { AdvancedOptionToggle } from "@fastform/ui/AdvancedOptionToggle";
import { Badge } from "@fastform/ui/Badge";
import { Button } from "@fastform/ui/Button";
import { Input } from "@fastform/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@fastform/ui/Select";
import { CheckCircleIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useCallback, useEffect, useState } from "react";
import { getAccessFlags } from "@fastform/lib/membership/utils";
import { TMembershipRole } from "@fastform/types/memberships";
interface WhenToSendCardProps {
  localform: TForm;
  setLocalform: (form: TForm) => void;
  environmentId: string;
  actionClasses: TActionClass[];
  membershipRole?: TMembershipRole;
}

export default function WhenToSendCard({
  environmentId,
  localform,
  setLocalform,
  actionClasses,
  membershipRole,
}: WhenToSendCardProps) {
  const [open, setOpen] = useState(localform.type === "web" ? true : false);
  const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [actionClassArray, setActionClassArray] = useState<TActionClass[]>(actionClasses);
  const { isViewer } = getAccessFlags(membershipRole);

  const autoClose = localform.autoClose !== null;

  const addTriggerEvent = useCallback(() => {
    const updatedform = { ...localform };
    updatedform.triggers = [...localform.triggers, ""];
    setLocalform(updatedform);
  }, [localform, setLocalform]);

  const setTriggerEvent = useCallback(
    (idx: number, actionClassName: string) => {
      const updatedform = { ...localform };
      const newActionClass = actionClassArray!.find((actionClass) => {
        return actionClass.name === actionClassName;
      });
      if (!newActionClass) {
        throw new Error("Action class not found");
      }
      updatedform.triggers[idx] = newActionClass.name;
      setLocalform(updatedform);
    },
    [actionClassArray, localform, setLocalform]
  );

  const removeTriggerEvent = (idx: number) => {
    const updatedform = { ...localform };
    updatedform.triggers = [...localform.triggers.slice(0, idx), ...localform.triggers.slice(idx + 1)];
    setLocalform(updatedform);
  };

  const handleCheckMark = () => {
    if (autoClose) {
      const updatedform = { ...localform, autoClose: null };
      setLocalform(updatedform);
    } else {
      const updatedform = { ...localform, autoClose: 10 };
      setLocalform(updatedform);
    }
  };

  const handleInputSeconds = (e: any) => {
    let value = parseInt(e.target.value);

    if (value < 1) value = 1;

    const updatedform = { ...localform, autoClose: value };
    setLocalform(updatedform);
  };

  const handleTriggerDelay = (e: any) => {
    let value = parseInt(e.target.value);
    const updatedform = { ...localform, delay: value };
    setLocalform(updatedform);
  };

  useEffect(() => {
    if (isAddEventModalOpen) return;
    if (activeIndex !== null) {
      const newActionClass = actionClassArray[actionClassArray.length - 1].name;
      const currentActionClass = localform.triggers[activeIndex];

      if (newActionClass !== currentActionClass) {
        setTriggerEvent(activeIndex, newActionClass);
      }

      setActiveIndex(null);
    }
  }, [actionClassArray, activeIndex, setTriggerEvent]);

  useEffect(() => {
    if (localform.type === "link") {
      setOpen(false);
    }
  }, [localform.type]);

  //create new empty trigger on page load, remove one click for user
  useEffect(() => {
    if (localform.triggers.length === 0) {
      addTriggerEvent();
    }
  }, [addTriggerEvent, localform.triggers.length]);

  return (
    <>
      <Collapsible.Root
        open={open}
        onOpenChange={(openState) => {
          if (localform.type !== "link") {
            setOpen(openState);
          }
        }}
        className="w-full rounded-lg border border-slate-300 bg-white">
        <Collapsible.CollapsibleTrigger
          asChild
          className={cn(
            localform.type !== "link"
              ? "cursor-pointer hover:bg-slate-50"
              : "cursor-not-allowed bg-slate-50",
            "h-full w-full rounded-lg "
          )}>
          <div className="inline-flex px-4 py-4">
            <div className="flex items-center pl-2 pr-5">
              {!localform.triggers || localform.triggers.length === 0 || !localform.triggers[0] ? (
                <div
                  className={cn(
                    localform.type !== "link"
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-300 bg-slate-100",
                    "h-7 w-7 rounded-full border "
                  )}
                />
              ) : (
                <CheckCircleIcon
                  className={cn(
                    localform.type !== "link" ? "text-green-400" : "text-slate-300",
                    "h-8 w-8 "
                  )}
                />
              )}
            </div>

            <div>
              <p className="font-semibold text-slate-800">Form Trigger</p>
              <p className="mt-1 text-sm text-slate-500">Choose the actions which trigger the form.</p>
            </div>
            {localform.type === "link" && (
              <div className="flex w-full items-center justify-end pr-2">
                <Badge size="normal" text="In-app form settings" type="gray" />
              </div>
            )}
          </div>
        </Collapsible.CollapsibleTrigger>
        <Collapsible.CollapsibleContent className="">
          <hr className="py-1 text-slate-600" />
          {!isAddEventModalOpen &&
            localform.triggers?.map((triggerEventClass, idx) => (
              <div className="mt-2" key={idx}>
                <div className="inline-flex items-center">
                  <p className="mr-2 w-14 text-right text-sm">{idx === 0 ? "When" : "or"}</p>
                  <Select
                    value={triggerEventClass}
                    onValueChange={(actionClassName) => setTriggerEvent(idx, actionClassName)}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <button
                        className="flex w-full items-center space-x-2 rounded-md p-1 text-sm font-semibold text-slate-800 hover:bg-slate-100 hover:text-slate-500"
                        value="none"
                        onClick={() => {
                          setAddEventModalOpen(true);
                          setActiveIndex(idx);
                        }}>
                        <PlusIcon className="mr-1 h-5 w-5" />
                        Add Action
                      </button>
                      <SelectSeparator />
                      {actionClassArray.map((actionClass) => (
                        <SelectItem
                          value={actionClass.name}
                          key={actionClass.name}
                          title={actionClass.description ? actionClass.description : ""}>
                          {actionClass.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mx-2 text-sm">action is performed</p>
                  <button onClick={() => removeTriggerEvent(idx)}>
                    <TrashIcon className="ml-3 h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          <div className="px-6 py-4">
            <Button
              variant="secondary"
              onClick={() => {
                addTriggerEvent();
              }}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add condition
            </Button>
          </div>

          {localform.type !== "link" && (
            <div className="ml-2 flex items-center space-x-1 px-4 pb-4">
              <label
                htmlFor="triggerDelay"
                className="flex w-full cursor-pointer items-center rounded-lg  border bg-slate-50 p-4">
                <div className="">
                  <p className="text-sm font-semibold text-slate-700">
                    Wait
                    <Input
                      type="number"
                      min="0"
                      id="triggerDelay"
                      value={localform.delay.toString()}
                      onChange={(e) => handleTriggerDelay(e)}
                      className="ml-2 mr-2 inline w-16 bg-white text-center text-sm"
                    />
                    seconds before showing the form.
                  </p>
                </div>
              </label>
            </div>
          )}

          <AdvancedOptionToggle
            htmlId="autoClose"
            isChecked={autoClose}
            onToggle={handleCheckMark}
            title="Auto close on inactivity"
            description="Automatically close the form if the user does not respond after certain number of seconds"
            childBorder={true}>
            <label htmlFor="autoCloseSeconds" className="cursor-pointer p-4">
              <p className="text-sm font-semibold text-slate-700">
                Automatically close form after
                <Input
                  type="number"
                  min="1"
                  id="autoCloseSeconds"
                  value={localform.autoClose?.toString()}
                  onChange={(e) => handleInputSeconds(e)}
                  className="mx-2 inline w-16 bg-white text-center text-sm"
                />
                seconds with no initial interaction.
              </p>
            </label>
          </AdvancedOptionToggle>
        </Collapsible.CollapsibleContent>
      </Collapsible.Root>
      <AddNoCodeActionModal
        environmentId={environmentId}
        open={isAddEventModalOpen}
        setOpen={setAddEventModalOpen}
        setActionClassArray={setActionClassArray}
        isViewer={isViewer}
      />
    </>
  );
}
