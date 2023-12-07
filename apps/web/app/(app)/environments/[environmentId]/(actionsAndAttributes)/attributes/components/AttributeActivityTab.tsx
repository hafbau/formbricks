"use client";

import { GetActiveInactiveformsAction } from "@/app/(app)/environments/[environmentId]/(actionsAndAttributes)/attributes/actions";
import LoadingSpinner from "@fastform/ui/LoadingSpinner";
import { capitalizeFirstLetter } from "@fastform/lib/strings";
import { convertDateTimeStringShort } from "@fastform/lib/time";
import { TAttributeClass } from "@fastform/types/attributeClasses";
import { ErrorComponent } from "@fastform/ui/ErrorComponent";
import { Label } from "@fastform/ui/Label";
import { TagIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

interface EventActivityTabProps {
  attributeClass: TAttributeClass;
}

export default function AttributeActivityTab({ attributeClass }: EventActivityTabProps) {
  const [activeforms, setActiveforms] = useState<string[] | undefined>();
  const [inactiveforms, setInactiveforms] = useState<string[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    getforms();

    async function getforms() {
      try {
        setLoading(true);
        const activeInactive = await GetActiveInactiveformsAction(attributeClass.id);
        setActiveforms(activeInactive.activeforms);
        setInactiveforms(activeInactive.inactiveforms);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
  }, [attributeClass.id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorComponent />;

  return (
    <div className="grid grid-cols-3 pb-2">
      <div className="col-span-2 space-y-4 pr-6">
        <div>
          <Label className="text-slate-500">Active forms</Label>
          {activeforms?.length === 0 && <p className="text-sm text-slate-900">-</p>}
          {activeforms?.map((formName) => (
            <p key={formName} className="text-sm text-slate-900">
              {formName}
            </p>
          ))}
        </div>
        <div>
          <Label className="text-slate-500">Inactive forms</Label>
          {inactiveforms?.length === 0 && <p className="text-sm text-slate-900">-</p>}
          {inactiveforms?.map((formName) => (
            <p key={formName} className="text-sm text-slate-900">
              {formName}
            </p>
          ))}
        </div>
      </div>
      <div className="col-span-1 space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-2">
        <div>
          <Label className="text-xs font-normal text-slate-500">Created on</Label>
          <p className=" text-xs text-slate-700">
            {convertDateTimeStringShort(attributeClass.createdAt.toString())}
          </p>
        </div>{" "}
        <div>
          <Label className=" text-xs font-normal text-slate-500">Last updated</Label>
          <p className=" text-xs text-slate-700">
            {convertDateTimeStringShort(attributeClass.updatedAt.toString())}
          </p>
        </div>
        <div>
          <Label className="block text-xs font-normal text-slate-500">Type</Label>
          <div className="mt-1 flex items-center">
            <div className="mr-1.5  h-4 w-4 text-slate-600">
              <TagIcon />
            </div>
            <p className="text-sm text-slate-700 ">{capitalizeFirstLetter(attributeClass.type)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
