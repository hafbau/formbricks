import ModalWithTabs from "@fastform/ui/ModalWithTabs";
import { TWebhook } from "@fastform/types/webhooks";
import WebhookOverviewTab from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/WebhookOverviewTab";
import WebhookSettingsTab from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/WebhookSettingsTab";
import { TSurvey } from "@fastform/types/surveys";
import { Webhook } from "lucide-react";

interface WebhookModalProps {
  environmentId: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  webhook: TWebhook;
  surveys: TSurvey[];
}

export default function WebhookModal({ environmentId, open, setOpen, webhook, surveys }: WebhookModalProps) {
  const tabs = [
    {
      title: "Overview",
      children: <WebhookOverviewTab webhook={webhook} surveys={surveys} />,
    },
    {
      title: "Settings",
      children: (
        <WebhookSettingsTab
          environmentId={environmentId}
          webhook={webhook}
          surveys={surveys}
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
