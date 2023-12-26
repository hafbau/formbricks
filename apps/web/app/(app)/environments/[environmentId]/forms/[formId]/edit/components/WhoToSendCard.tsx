"use client";

import { cn } from "@fastform/lib/cn";
import { TAttributeClass } from "@fastform/types/attributeClasses";
import { TForm } from "@fastform/types/forms";
import { Alert, AlertDescription, AlertTitle } from "@fastform/ui/Alert";
import { Badge } from "@fastform/ui/Badge";
import { Button } from "@fastform/ui/Button";
import { Input } from "@fastform/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fastform/ui/Select";
import { CheckCircleIcon, FunnelIcon, PlusIcon, TrashIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Info } from "lucide-react";
import { useEffect, useState } from "react"; /*  */

const filterConditions = [
  { id: "equals", name: "equals" },
  { id: "notEquals", name: "not equals" },
];

interface WhoToSendCardProps {
  localform: TForm;
  setLocalform: (form: TForm) => void;
  environmentId: string;
  attributeClasses: TAttributeClass[];
}

export default function WhoToSendCard({ localform, setLocalform, attributeClasses }: WhoToSendCardProps) {
  const [open, setOpen] = useState(false);
  const condition = filterConditions[0].id === "equals" ? "equals" : "notEquals";

  useEffect(() => {
    if (localform.type === "link") {
      setOpen(false);
    }
  }, [localform.type]);

  const addAttributeFilter = () => {
    const updatedform = { ...localform };
    updatedform.attributeFilters = [
      ...localform.attributeFilters,
      { attributeClassId: "", condition: condition, value: "" },
    ];
    setLocalform(updatedform);
  };

  const setAttributeFilter = (idx: number, attributeClassId: string, condition: string, value: string) => {
    const updatedform = { ...localform };
    updatedform.attributeFilters[idx] = {
      attributeClassId,
      condition: condition === "equals" ? "equals" : "notEquals",
      value,
    };
    setLocalform(updatedform);
  };

  const removeAttributeFilter = (idx: number) => {
    const updatedform = { ...localform };
    updatedform.attributeFilters = [
      ...localform.attributeFilters.slice(0, idx),
      ...localform.attributeFilters.slice(idx + 1),
    ];
    setLocalform(updatedform);
  };

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
          <div className="inline-flex px-4 py-6">
            <div className="flex items-center pl-2 pr-5">
              <CheckCircleIcon
                className={cn(localform.type !== "link" ? "text-green-400" : "text-slate-300", "h-8 w-8 ")}
              />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Target Audience</p>
              <p className="mt-1 text-sm text-slate-500">Pre-segment your users with attributes filters.</p>
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

          <div className="mx-6 mb-4 mt-3">
            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertTitle>User Identification</AlertTitle>
              <AlertDescription>
                To target your audience you need to identify your users within your app. You can read more
                about how to do this in our{" "}
                <a
                  href="https://getfastform.com/docs/attributes/identify-users"
                  className="underline"
                  target="_blank">
                  docs
                </a>
                .
              </AlertDescription>
            </Alert>
          </div>

          <div className="mx-6 flex items-center rounded-lg border border-slate-200 p-4 text-slate-800">
            <div>
              {localform.attributeFilters?.length === 0 ? (
                <UserGroupIcon className="mr-4 h-6 w-6 text-slate-600" />
              ) : (
                <FunnelIcon className="mr-4 h-6 w-6 text-slate-600" />
              )}
            </div>
            <div>
              <p className="">
                Current:{" "}
                <span className="font-semibold text-slate-900">
                  {localform.attributeFilters?.length === 0 ? "All users" : "Filtered"}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {localform.attributeFilters?.length === 0
                  ? "All users can see the form."
                  : "Only users who match the attribute filter will see the form."}
              </p>
            </div>
          </div>

          {localform.attributeFilters?.map((attributeFilter, idx) => (
            <div className="mt-4 px-5" key={idx}>
              <div className="justify-left flex items-center space-x-3">
                <p className={cn(idx !== 0 && "ml-5", "text-right text-sm")}>{idx === 0 ? "Where" : "and"}</p>
                <Select
                  value={attributeFilter.attributeClassId}
                  onValueChange={(attributeClassId) =>
                    setAttributeFilter(
                      idx,
                      attributeClassId,
                      attributeFilter.condition,
                      attributeFilter.value
                    )
                  }>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {attributeClasses
                      .filter((attributeClass) => !attributeClass.archived)
                      .map((attributeClass) => (
                        <SelectItem value={attributeClass.id}>{attributeClass.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  value={attributeFilter.condition}
                  onValueChange={(condition) =>
                    setAttributeFilter(
                      idx,
                      attributeFilter.attributeClassId,
                      condition,
                      attributeFilter.value
                    )
                  }>
                  <SelectTrigger className="w-[210px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterConditions.map((filterCondition) => (
                      <SelectItem value={filterCondition.id}>{filterCondition.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={attributeFilter.value}
                  onChange={(e) => {
                    e.preventDefault();
                    setAttributeFilter(
                      idx,
                      attributeFilter.attributeClassId,
                      attributeFilter.condition,
                      e.target.value
                    );
                  }}
                />
                <button onClick={() => removeAttributeFilter(idx)}>
                  <TrashIcon className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
          <div className="px-6 py-4">
            <Button
              variant="secondary"
              onClick={() => {
                addAttributeFilter();
              }}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add filter
            </Button>
          </div>
        </Collapsible.CollapsibleContent>
      </Collapsible.Root>
    </>
  );
}
