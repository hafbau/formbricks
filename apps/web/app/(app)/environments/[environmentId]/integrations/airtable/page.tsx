import AirtableWrapper from "@/app/(app)/environments/[environmentId]/integrations/airtable/components/AirtableWrapper";
import { getAirtableTables } from "@fastform/lib/airtable/service";
import { AIRTABLE_CLIENT_ID, WEBAPP_URL } from "@fastform/lib/constants";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getIntegrations } from "@fastform/lib/integration/service";
import { getforms } from "@fastform/lib/form/service";
import { TIntegrationItem } from "@fastform/types/integration";
import { TIntegrationAirtable } from "@fastform/types/integration/airtable";
import GoBackButton from "@fastform/ui/GoBackButton";

export default async function Airtable({ params }) {
  const enabled = !!AIRTABLE_CLIENT_ID;
  const [forms, integrations, environment] = await Promise.all([
    getforms(params.environmentId),
    getIntegrations(params.environmentId),
    getEnvironment(params.environmentId),
  ]);
  if (!environment) {
    throw new Error("Environment not found");
  }

  const airtableIntegration: TIntegrationAirtable | undefined = integrations?.find(
    (integration): integration is TIntegrationAirtable => integration.type === "airtable"
  );

  let airtableArray: TIntegrationItem[] = [];
  if (airtableIntegration && airtableIntegration.config.key) {
    airtableArray = await getAirtableTables(params.environmentId);
  }

  return (
    <>
      <GoBackButton url={`${WEBAPP_URL}/environments/${params.environmentId}/integrations`} />
      <div className="h-[75vh] w-full">
        <AirtableWrapper
          enabled={enabled}
          airtableIntegration={airtableIntegration}
          airtableArray={airtableArray}
          environmentId={environment.id}
          forms={forms}
          environment={environment}
          webAppUrl={WEBAPP_URL}
        />
      </div>
    </>
  );
}
