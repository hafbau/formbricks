export const revalidate = REVALIDATION_INTERVAL;

import WebhookRowData from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/WebhookRowData";
import WebhookTable from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/WebhookTable";
import WebhookTableHeading from "@/app/(app)/environments/[environmentId]/integrations/webhooks/components/WebhookTableHeading";
import GoBackButton from "@fastform/ui/GoBackButton";
import { getSurveys } from "@fastform/lib/form/service";
import { getWebhooks } from "@fastform/lib/webhook/service";
import { REVALIDATION_INTERVAL } from "@fastform/lib/constants";
import { getEnvironment } from "@fastform/lib/environment/service";

export default async function CustomWebhookPage({ params }) {
  const [webhooksUnsorted, surveys, environment] = await Promise.all([
    getWebhooks(params.environmentId),
    getSurveys(params.environmentId),
    getEnvironment(params.environmentId),
  ]);
  if (!environment) {
    throw new Error("Environment not found");
  }
  const webhooks = webhooksUnsorted.sort((a, b) => {
    if (a.createdAt > b.createdAt) return -1;
    if (a.createdAt < b.createdAt) return 1;
    return 0;
  });
  return (
    <>
      <GoBackButton />
      <WebhookTable environment={environment} webhooks={webhooks} surveys={surveys}>
        <WebhookTableHeading />
        {webhooks.map((webhook) => (
          <WebhookRowData key={webhook.id} webhook={webhook} surveys={surveys} />
        ))}
      </WebhookTable>
    </>
  );
}
