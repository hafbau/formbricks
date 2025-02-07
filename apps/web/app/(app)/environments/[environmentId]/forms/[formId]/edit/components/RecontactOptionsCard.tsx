"use client";

import { cn } from "@fastform/lib/cn";
import { TForm } from "@fastform/types/forms";
import { AdvancedOptionToggle } from "@fastform/ui/AdvancedOptionToggle";
import { Badge } from "@fastform/ui/Badge";
import { Input } from "@fastform/ui/Input";
import { Label } from "@fastform/ui/Label";
import { RadioGroup, RadioGroupItem } from "@fastform/ui/RadioGroup";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DisplayOption {
  id: "displayOnce" | "displayMultiple" | "respondMultiple";
  name: string;
  description: string;
}

const displayOptions: DisplayOption[] = [
  {
    id: "displayOnce",
    name: "Show only once",
    description: "The form will be shown once, even if person doesn't respond.",
  },
  {
    id: "displayMultiple",
    name: "Until they submit a response",
    description: "If you really want that answer, ask until you get it.",
  },
  {
    id: "respondMultiple",
    name: "Keep showing while conditions match",
    description: "Even after they submitted a response (e.g. Feedback Box)",
  },
];

interface RecontactOptionsCardProps {
  localform: TForm;
  setLocalform: (form: TForm) => void;
  environmentId: string;
}

export default function RecontactOptionsCard({
  localform,
  setLocalform,
  environmentId,
}: RecontactOptionsCardProps) {
  const [open, setOpen] = useState(false);
  const ignoreWaiting = localform.recontactDays !== null;
  const [inputDays, setInputDays] = useState(
    localform.recontactDays !== null ? localform.recontactDays : 1
  );

  const handleCheckMark = () => {
    if (ignoreWaiting) {
      const updatedform = { ...localform, recontactDays: null };
      setLocalform(updatedform);
    } else {
      const updatedform = { ...localform, recontactDays: 0 };
      setLocalform(updatedform);
    }
  };

  const handleRecontactDaysChange = (event) => {
    const value = Number(event.target.value);
    setInputDays(value);

    const updatedform = { ...localform, recontactDays: value };
    setLocalform(updatedform);
  };

  useEffect(() => {
    if (localform.type === "link") {
      setOpen(false);
    }
  }, [localform.type]);

  /*   if (localform.type === "link") {
    return null;
  } */

  return (
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
          localform.type !== "link" ? "cursor-pointer hover:bg-slate-50" : "cursor-not-allowed bg-slate-50",
          "h-full w-full rounded-lg "
        )}>
        <div className="inline-flex px-4 py-4">
          <div className="flex items-center pl-2 pr-5">
            <CheckCircleIcon
              className={cn(localform.type !== "link" ? "text-green-400" : "text-slate-300", "h-8 w-8 ")}
            />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Recontact Options</p>
            <p className="mt-1 text-sm text-slate-500">Decide how often people can answer this form.</p>
          </div>
          {localform.type === "link" && (
            <div className="flex w-full items-center justify-end pr-2">
              <Badge size="normal" text="In-app form settings" type="gray" />
            </div>
          )}
        </div>
      </Collapsible.CollapsibleTrigger>
      <Collapsible.CollapsibleContent className="pb-3">
        <hr className="py-1 text-slate-600" />
        <div className="p-3">
          <RadioGroup
            value={localform.displayOption}
            className="flex flex-col space-y-3"
            onValueChange={(v) => {
              if (v === "displayOnce" || v === "displayMultiple" || v === "respondMultiple") {
                const updatedform = { ...localform, displayOption: v };
                // @ts-ignore
                setLocalform(updatedform);
              }
            }}>
            {displayOptions.map((option) => (
              <Label
                key={option.name}
                htmlFor={option.name}
                className="flex w-full cursor-pointer items-center rounded-lg border bg-slate-50 p-4">
                <RadioGroupItem
                  value={option.id}
                  id={option.name}
                  className="aria-checked:border-brand-dark  mx-5 disabled:border-slate-400 aria-checked:border-2"
                />
                <div className="">
                  <p className="font-semibold text-slate-700">{option.name}</p>

                  <p className="mt-2 text-xs font-normal text-slate-600">{option.description}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        <AdvancedOptionToggle
          htmlId="recontactDays"
          isChecked={ignoreWaiting}
          onToggle={handleCheckMark}
          title="Ignore waiting time between forms"
          childBorder={false}
          description={
            <>
              This setting overwrites your{" "}
              <Link
                className="decoration-brand-dark underline"
                href={`/environments/${environmentId}/settings/product`}
                target="_blank">
                waiting period
              </Link>
              . Use with caution.
            </>
          }>
          {localform.recontactDays !== null && (
            <RadioGroup
              value={localform.recontactDays.toString()}
              className="flex w-full flex-col space-y-3 bg-white"
              onValueChange={(v) => {
                const updatedform = { ...localform, recontactDays: v === "null" ? null : Number(v) };
                setLocalform(updatedform);
              }}>
              <Label
                htmlFor="ignore"
                className="flex w-full cursor-pointer items-center rounded-lg border bg-slate-50 p-4">
                <RadioGroupItem
                  value="0"
                  id="ignore"
                  className="aria-checked:border-brand-dark mx-4 text-sm disabled:border-slate-400 aria-checked:border-2"
                />
                <div>
                  <p className="font-semibold text-slate-700">Always show form</p>

                  <p className="mt-2 text-xs font-normal text-slate-600">
                    When conditions match, waiting time will be ignored and form shown.
                  </p>
                </div>
              </Label>

              <label
                htmlFor="newDays"
                className="flex w-full cursor-pointer items-center rounded-lg border bg-slate-50 p-4">
                <RadioGroupItem
                  value={inputDays === 0 ? "1" : inputDays.toString()} //Fixes that both radio buttons are checked when inputDays is 0
                  id="newDays"
                  className="aria-checked:border-brand-dark mx-4 disabled:border-slate-400 aria-checked:border-2"
                />
                <div className="">
                  <p className="text-sm font-semibold text-slate-700">
                    Wait
                    <Input
                      type="number"
                      min="1"
                      id="inputDays"
                      value={inputDays === 0 ? 1 : inputDays}
                      onChange={handleRecontactDaysChange}
                      className="ml-2 mr-2 inline w-16 text-center text-sm"
                    />
                    days before showing this form again.
                  </p>

                  <p className="mt-2 text-xs font-normal text-slate-600">
                    Overwrites waiting period between forms to {inputDays === 0 ? 1 : inputDays} day(s).
                  </p>
                </div>
              </label>
            </RadioGroup>
          )}
        </AdvancedOptionToggle>
      </Collapsible.CollapsibleContent>
    </Collapsible.Root>
  );
}
