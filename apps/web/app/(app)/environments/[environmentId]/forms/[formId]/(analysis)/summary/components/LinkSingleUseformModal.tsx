"use client";

import { generateSingleUseIdAction } from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/actions";
import { truncateMiddle } from "@fastform/lib/strings";
import { cn } from "@fastform/lib/cn";
import { Tform } from "@fastform/types/forms";
import { Button } from "@fastform/ui/Button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { DocumentDuplicateIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface LinkSingleUseformModalProps {
  form: Tform;
  formBaseUrl: string;
}

export default function LinkSingleUseformModal({ form, formBaseUrl }: LinkSingleUseformModalProps) {
  const [singleUseIds, setSingleUseIds] = useState<string[] | null>(null);

  useEffect(() => {
    fetchSingleUseIds();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.singleUse?.isEncrypted]);

  const fetchSingleUseIds = async () => {
    const ids = await generateSingleUseIds(form.singleUse?.isEncrypted ?? false);
    setSingleUseIds(ids);
  };

  const generateSingleUseIds = async (isEncrypted: boolean) => {
    const promises = Array(7)
      .fill(null)
      .map(() => generateSingleUseIdAction(form.id, isEncrypted));
    return await Promise.all(promises);
  };

  const defaultformUrl = `${formBaseUrl}/s/${form.id}`;
  const [selectedSingleUseIds, setSelectedSingleIds] = useState<number[]>([]);

  const linkTextRef = useRef<HTMLDivElement>(null);

  const handleLinkOnClick = (index: number) => {
    if (!singleUseIds) return;
    setSelectedSingleIds([...selectedSingleUseIds, index]);
    const formUrl = `${defaultformUrl}?suId=${singleUseIds[index]}`;
    navigator.clipboard.writeText(formUrl);
    toast.success("URL copied to clipboard!");
  };

  return (
    <>
      {singleUseIds && (
        <div className="w-full">
          <div className="flex justify-end">
            <Button
              variant="darkCTA"
              title="Preview form"
              aria-label="Preview form"
              className="flex w-fit justify-center"
              href={`${defaultformUrl}?suId=${singleUseIds[0]}&preview=true`}
              target="_blank"
              EndIcon={EyeIcon}>
              Preview Form
            </Button>
          </div>

          <div className="my-4 border-t border-slate-300 pb-2 pt-4">
            <p className="mb-3 font-semibold text-slate-800">Single Use Links</p>
            <div ref={linkTextRef} className="min flex flex-col space-y-4">
              {singleUseIds &&
                singleUseIds.map((singleUseId, index) => {
                  const isSelected = selectedSingleUseIds.includes(index);
                  return (
                    <div className="flex h-fit  justify-center p-0">
                      <div
                        key={singleUseId}
                        className={cn(
                          "row relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-lg border border-slate-300 bg-white px-6 py-2 text-left text-slate-800 transition-all duration-200 ease-in-out hover:border-slate-500",
                          isSelected && "border-slate-200 text-slate-400 hover:border-slate-200"
                        )}
                        onClick={() => {
                          if (!isSelected) {
                            handleLinkOnClick(index);
                          }
                        }}>
                        <span>{truncateMiddle(`${defaultformUrl}?suId=${singleUseId}`, 48)}</span>
                      </div>
                      <div className="ml-2 min-h-full">
                        <Button
                          variant="secondary"
                          className="m-0 my-0 h-full w-full overflow-hidden whitespace-pre text-center"
                          onClick={() => handleLinkOnClick(index)}>
                          {isSelected ? "Copied" : "  Copy  "}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              title="Generate new single-use form link"
              aria-label="Generate new single-use form link"
              className="flex justify-center"
              onClick={() => {
                fetchSingleUseIds();
                setSelectedSingleIds([]);
                toast.success("New form links generated!");
              }}
              EndIcon={ArrowPathIcon}>
              Regenerate
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedSingleIds(Array.from(singleUseIds.keys()));
                const allformUrls = singleUseIds
                  .map((singleUseId) => `${defaultformUrl}?suId=${singleUseId}`)
                  .join("\n");
                navigator.clipboard.writeText(allformUrls);
                toast.success("All URLs copied to clipboard!");
              }}
              title="Copy all form links to clipboard"
              aria-label="Copy all form links to clipboard"
              className="flex justify-center"
              EndIcon={DocumentDuplicateIcon}>
              Copy all URLs
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
