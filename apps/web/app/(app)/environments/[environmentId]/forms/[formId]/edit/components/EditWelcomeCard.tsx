"use client";
import { cn } from "@fastform/lib/cn";
import { md } from "@fastform/lib/markdownIt";
import { TForm } from "@fastform/types/forms";
import { Editor } from "@fastform/ui/Editor";
import FileInput from "@fastform/ui/FileInput";
import { Input } from "@fastform/ui/Input";
import { Label } from "@fastform/ui/Label";
import { Switch } from "@fastform/ui/Switch";
import * as Collapsible from "@radix-ui/react-collapsible";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface EditWelcomeCardProps {
  localform: TForm;
  setLocalform: (form: TForm) => void;
  setActiveQuestionId: (id: string | null) => void;
  activeQuestionId: string | null;
}

export default function EditWelcomeCard({
  localform,
  setLocalform,
  setActiveQuestionId,
  activeQuestionId,
}: EditWelcomeCardProps) {
  const [firstRender, setFirstRender] = useState(true);
  const path = usePathname();
  const environmentId = path?.split("/environments/")[1]?.split("/")[0];
  // const [open, setOpen] = useState(false);
  let open = activeQuestionId == "start";
  const setOpen = (e) => {
    if (e) {
      setActiveQuestionId("start");
    } else {
      setActiveQuestionId(null);
    }
  };

  const updateform = (data) => {
    setLocalform({
      ...localform,
      welcomeCard: {
        ...localform.welcomeCard,
        ...data,
      },
    });
  };

  return (
    <div
      className={cn(
        open ? "scale-100 shadow-lg " : "scale-97 shadow-md",
        "flex flex-row rounded-lg bg-white transition-transform duration-300 ease-in-out"
      )}>
      <div
        className={cn(
          open ? "bg-slate-700" : "bg-slate-400",
          "flex w-10 items-center justify-center rounded-l-lg hover:bg-slate-600 group-aria-expanded:rounded-bl-none"
        )}>
        <p>✋</p>
      </div>
      <Collapsible.Root
        open={open}
        onOpenChange={setOpen}
        className="flex-1 rounded-r-lg border border-slate-200 transition-all duration-300 ease-in-out">
        <Collapsible.CollapsibleTrigger
          asChild
          className="flex cursor-pointer justify-between p-4 hover:bg-slate-50">
          <div>
            <div className="inline-flex">
              <div>
                <p className="text-sm font-semibold">Welcome Card</p>
                {!open && (
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {localform?.welcomeCard?.enabled ? "Shown" : "Hidden"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="welcome-toggle">Enabled</Label>

              <Switch
                id="welcome-toggle"
                checked={localform?.welcomeCard?.enabled}
                onClick={(e) => {
                  e.stopPropagation();
                  updateform({ enabled: !localform.welcomeCard?.enabled });
                }}
              />
            </div>
          </div>
        </Collapsible.CollapsibleTrigger>
        <Collapsible.CollapsibleContent className="px-4 pb-6">
          <form>
            <div className="mt-2">
              <Label htmlFor="companyLogo">Company Logo</Label>
            </div>
            <div className="mt-3 flex w-full items-center justify-center">
              <FileInput
                id="welcome-card-image"
                allowedFileExtensions={["png", "jpeg", "jpg"]}
                environmentId={environmentId}
                onFileUpload={(url: string[]) => {
                  updateform({ fileUrl: url[0] });
                }}
                fileUrl={localform?.welcomeCard?.fileUrl}
              />
            </div>
            <div className="mt-3">
              <Label htmlFor="headline">Headline</Label>
              <div className="mt-2">
                <Input
                  id="headline"
                  name="headline"
                  defaultValue={localform?.welcomeCard?.headline}
                  onChange={(e) => {
                    updateform({ headline: e.target.value });
                  }}
                />
              </div>
            </div>
            <div className="mt-3">
              <Label htmlFor="subheader">Welcome Message</Label>
              <div className="mt-2">
                <Editor
                  getText={() =>
                    md.render(
                      localform?.welcomeCard?.html || "Thanks for providing your feedback - let's go!"
                    )
                  }
                  setText={(value: string) => {
                    updateform({ html: value });
                  }}
                  excludedToolbarItems={["blockType"]}
                  disableLists
                  firstRender={firstRender}
                  setFirstRender={setFirstRender}
                />
              </div>
            </div>

            <div className="mt-3 flex justify-between gap-8">
              <div className="flex w-full space-x-2">
                <div className="w-full">
                  <Label htmlFor="buttonLabel">Button Label</Label>
                  <div className="mt-2">
                    <Input
                      id="buttonLabel"
                      name="buttonLabel"
                      defaultValue={localform?.welcomeCard?.buttonLabel || "Next"}
                      onChange={(e) => updateform({ buttonLabel: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center">
              <div className="mr-2">
                <Switch
                  id="timeToFinish"
                  name="timeToFinish"
                  checked={localform?.welcomeCard?.timeToFinish}
                  onCheckedChange={() =>
                    updateform({ timeToFinish: !localform.welcomeCard.timeToFinish })
                  }
                />
              </div>
              <div className="flex-column">
                <Label htmlFor="timeToFinish" className="">
                  Time to Finish
                </Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Display an estimate of completion time for form
                </div>
              </div>
            </div>
            {localform?.type === "link" && (
              <div className="mt-6 flex items-center">
                <div className="mr-2">
                  <Switch
                    id="showResponseCount"
                    name="showResponseCount"
                    checked={localform?.welcomeCard?.showResponseCount}
                    onCheckedChange={() =>
                      updateform({ showResponseCount: !localform.welcomeCard.showResponseCount })
                    }
                  />
                </div>
                <div className="flex-column">
                  <Label htmlFor="showResponseCount" className="">
                    Show Response Count
                  </Label>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Display number of responses for form
                  </div>
                </div>
              </div>
            )}
          </form>
        </Collapsible.CollapsibleContent>
      </Collapsible.Root>
    </div>
  );
}
