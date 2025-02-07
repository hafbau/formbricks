import GoogleSheetWrapper from "@/app/(app)/environments/[environmentId]/integrations/google-sheets/components/GoogleSheetWrapper";
import {
  GOOGLE_SHEETS_CLIENT_ID,
  GOOGLE_SHEETS_CLIENT_SECRET,
  GOOGLE_SHEETS_REDIRECT_URL,
  WEBAPP_URL,
} from "@fastform/lib/constants";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getSpreadSheets } from "@fastform/lib/googleSheet/service";
import { getIntegrations } from "@fastform/lib/integration/service";
import { getforms } from "@fastform/lib/form/service";
import { TIntegrationItem } from "@fastform/types/integration";
import { TIntegrationGoogleSheets } from "@fastform/types/integration/googleSheet";
import GoBackButton from "@fastform/ui/GoBackButton";

export default async function GoogleSheet({ params }) {
  const enabled = !!(GOOGLE_SHEETS_CLIENT_ID && GOOGLE_SHEETS_CLIENT_SECRET && GOOGLE_SHEETS_REDIRECT_URL);
  const [forms, integrations, environment] = await Promise.all([
    getforms(params.environmentId),
    getIntegrations(params.environmentId),
    getEnvironment(params.environmentId),
  ]);
  if (!environment) {
    throw new Error("Environment not found");
  }

  const googleSheetIntegration: TIntegrationGoogleSheets | undefined = integrations?.find(
    (integration): integration is TIntegrationGoogleSheets => integration.type === "googleSheets"
  );
  let spreadSheetArray: TIntegrationItem[] = [];
  if (googleSheetIntegration && googleSheetIntegration.config.key) {
    spreadSheetArray = await getSpreadSheets(params.environmentId);
  }
  return (
    <>
      <GoBackButton url={`${WEBAPP_URL}/environments/${params.environmentId}/integrations`} />
      <div className="h-[75vh] w-full">
        <GoogleSheetWrapper
          enabled={enabled}
          environment={environment}
          forms={forms}
          spreadSheetArray={spreadSheetArray}
          googleSheetIntegration={googleSheetIntegration}
          webAppUrl={WEBAPP_URL}
        />
      </div>
    </>
  );
}
