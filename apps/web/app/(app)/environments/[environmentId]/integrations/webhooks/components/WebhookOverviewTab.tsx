import { Label } from "@fastform/ui/Label";
import { convertDateTimeStringShort } from "@fastform/lib/time";
import { TWebhook } from "@fastform/types/webhooks";
import { TForm } from "@fastform/types/forms";
import { capitalizeFirstLetter } from "@fastform/lib/strings";

interface ActivityTabProps {
  webhook: TWebhook;
  forms: TForm[];
}

const getformNamesForWebhook = (webhook: TWebhook, allforms: TForm[]): string[] => {
  if (webhook.formIds.length === 0) {
    return allforms.map((form) => form.name);
  } else {
    return webhook.formIds.map((formId) => {
      const form = allforms.find((form) => form.id === formId);
      return form ? form.name : "";
    });
  }
};

const convertTriggerIdToName = (triggerId: string): string => {
  switch (triggerId) {
    case "responseCreated":
      return "Response Created";
    case "responseUpdated":
      return "Response Updated";
    case "responseFinished":
      return "Response Finished";
    default:
      return triggerId;
  }
};

export default function WebhookOverviewTab({ webhook, forms }: ActivityTabProps) {
  return (
    <div className="grid grid-cols-3 pb-2">
      <div className="col-span-2 space-y-4 pr-6">
        <div>
          <Label className="text-slate-500">Name</Label>
          <p className="truncate text-sm text-slate-900">{webhook.name ? webhook.name : "-"}</p>
        </div>

        <div>
          <Label className="text-slate-500">Created by a Third Party</Label>
          <p className="text-sm text-slate-900">
            {webhook.source === "user" ? "No" : capitalizeFirstLetter(webhook.source)}
          </p>
        </div>

        <div>
          <Label className="text-slate-500">URL</Label>
          <p className="text-sm text-slate-900">{webhook.url}</p>
        </div>

        <div>
          <Label className="text-slate-500">forms</Label>

          {getformNamesForWebhook(webhook, forms).map((formName, index) => (
            <p key={index} className="text-sm text-slate-900">
              {formName}
            </p>
          ))}
        </div>
        <div>
          <Label className="text-slate-500">Triggers</Label>
          {webhook.triggers.map((triggerId) => (
            <p key={triggerId} className="text-sm text-slate-900">
              {convertTriggerIdToName(triggerId)}
            </p>
          ))}
        </div>
      </div>
      <div className="col-span-1 space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-2">
        <div>
          <Label className="text-xs font-normal text-slate-500">Created on</Label>
          <p className=" text-xs text-slate-700">
            {convertDateTimeStringShort(webhook.createdAt?.toString())}
          </p>
        </div>
        <div>
          <Label className=" text-xs font-normal text-slate-500">Last updated</Label>
          <p className=" text-xs text-slate-700">
            {convertDateTimeStringShort(webhook.updatedAt?.toString())}
          </p>
        </div>
      </div>
    </div>
  );
}
