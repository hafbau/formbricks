"use client";

import { cn } from "@fastform/lib/cn";
import { TForm } from "@fastform/types/forms";
import { Input } from "@fastform/ui/Input";
import { Label } from "@fastform/ui/Label";
import { Switch } from "@fastform/ui/Switch";
import * as Collapsible from "@radix-ui/react-collapsible";

interface EditThankYouCardProps {
  localform: TForm;
  setLocalform: (form: TForm) => void;
  setActiveQuestionId: (id: string | null) => void;
  activeQuestionId: string | null;
}

export default function EditThankYouCard({
  localform,
  setLocalform,
  setActiveQuestionId,
  activeQuestionId,
}: EditThankYouCardProps) {
  // const [open, setOpen] = useState(false);
  let open = activeQuestionId == "end";
  const setOpen = (e) => {
    if (e) {
      setActiveQuestionId("end");
    } else {
      setActiveQuestionId(null);
    }
  };

  const updateform = (data) => {
    setLocalform({
      ...localform,
      thankYouCard: {
        ...localform.thankYouCard,
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
        <p>🙏</p>
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
                <p className="text-sm font-semibold">Thank You Card</p>
                {!open && (
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {localform?.thankYouCard?.enabled ? "Shown" : "Hidden"}
                  </p>
                )}
              </div>
            </div>

            {localform.type !== "link" && (
              <div className="flex items-center space-x-2">
                <Label htmlFor="thank-you-toggle">Show</Label>

                <Switch
                  id="thank-you-toggle"
                  checked={localform?.thankYouCard?.enabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateform({ enabled: !localform.thankYouCard?.enabled });
                  }}
                />
              </div>
            )}
          </div>
        </Collapsible.CollapsibleTrigger>
        <Collapsible.CollapsibleContent className="px-4 pb-6">
          <form>
            <div className="mt-3">
              <Label htmlFor="headline">Headline</Label>
              <div className="mt-2">
                <Input
                  id="headline"
                  name="headline"
                  defaultValue={localform?.thankYouCard?.headline}
                  onChange={(e) => {
                    updateform({ headline: e.target.value });
                  }}
                />
              </div>
            </div>

            <div className="mt-3">
              <Label htmlFor="subheader">Description</Label>
              <div className="mt-2">
                <Input
                  id="subheader"
                  name="subheader"
                  defaultValue={localform?.thankYouCard?.subheader}
                  onChange={(e) => {
                    updateform({ subheader: e.target.value });
                  }}
                />
              </div>
            </div>
          </form>
        </Collapsible.CollapsibleContent>
      </Collapsible.Root>
    </div>
  );
}
