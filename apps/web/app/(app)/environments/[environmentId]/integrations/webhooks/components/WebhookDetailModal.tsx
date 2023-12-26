import ModalWithTabs from "@fastform/ui/ModalWithTabs";
import { TWebhook } from "@fastform/types/webhooks";
import WebhookOverviewTab from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/WebhookOverviewTab";
import WebhookSettingsTab from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/WebhookSettingsTab";
import { TForm } from "@fastform/types/forms";
import { Webhook } from "lucide-react";

interface WebhookModalProps {
  environmentId: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  webhook: TWebhook;
  forms: TForm[];
}

export default function WebhookModal({ environmentId, open, setOpen, webhook, forms }: WebhookModalProps) {
  const tabs = [
    {
      title: "Overview",
      children: <WebhookOverviewTab webhook={webhook} forms={forms} />,
    },
    {
      title: "Settings",
      children: (
        <WebhookSettingsTab
          environmentId={environmentId}
          webhook={webhook}
          forms={forms}
          setOpen={setOpen}
        />
      ),
    },
  ];

  return (
    <>
      <ModalWithTabs
        open={open}
        setOpen={setOpen}
        tabs={tabs}
        icon={<Webhook />}
        label={webhook.name ? webhook.name : webhook.url}
        description={""}
      />
    </>
  );
}
