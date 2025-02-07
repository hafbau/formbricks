import AirtableLogo from "./airtable/images/airtable.svg";
import GoogleSheetsLogo from "./google-sheets/images/google-sheets-small.png";
import JsLogo from "@/images/jslogo.png";
import MakeLogo from "@/images/make-small.png";
import n8nLogo from "@/images/n8n.png";
import WebhookLogo from "@/images/webhook.png";
import ZapierLogo from "@/images/zapier-small.png";
import { Card } from "@fastform/ui/Card";
import Image from "next/image";
import { getWebhookCountBySource } from "@fastform/lib/webhook/service";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getIntegrations } from "@fastform/lib/integration/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { authOptions } from "@fastform/lib/authOptions";
import { getAccessFlags } from "@fastform/lib/membership/utils";
import { getServerSession } from "next-auth";
import { ErrorComponent } from "@fastform/ui/ErrorComponent";

export default async function IntegrationsPage({ params }) {
  const environmentId = params.environmentId;

  const [
    environment,
    integrations,
    team,
    session,
    userWebhookCount,
    zapierWebhookCount,
    makeWebhookCount,
    n8nwebhookCount,
  ] = await Promise.all([
    getEnvironment(environmentId),
    getIntegrations(environmentId),
    getTeamByEnvironmentId(params.environmentId),
    getServerSession(authOptions),
    getWebhookCountBySource(environmentId, "user"),
    getWebhookCountBySource(environmentId, "zapier"),
    getWebhookCountBySource(environmentId, "make"),
    getWebhookCountBySource(environmentId, "n8n"),
  ]);

  if (!session) {
    throw new Error("Session not found");
  }

  if (!team) {
    throw new Error("Team not found");
  }

  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);
  const { isViewer } = getAccessFlags(currentUserMembership?.role);

  const containsGoogleSheetIntegration = integrations.some(
    (integration) => integration.type === "googleSheets"
  );

  const containsAirtableIntegration = integrations.some((integration) => integration.type === "airtable");

  const integrationCards = [
    {
      docsHref: "https://getfastform.com/docs/getting-started/framework-guides#next-js",
      docsText: "Docs",
      docsNewTab: true,
      label: "Javascript Widget",
      description: "Integrate Fastform into your Webapp",
      icon: <Image src={JsLogo} alt="Javascript Logo" />,
      connected: environment?.widgetSetupCompleted,
      statusText: environment?.widgetSetupCompleted ? "Connected" : "Not Connected",
    },
    {
      docsHref: "https://getfastform.com/docs/integrations/zapier",
      docsText: "Docs",
      docsNewTab: true,
      connectHref: "https://zapier.com/apps/fastform/integrations",
      connectText: "Connect",
      connectNewTab: true,
      label: "Zapier",
      description: "Integrate Fastform with 5000+ apps via Zapier",
      icon: <Image src={ZapierLogo} alt="Zapier Logo" />,
      connected: zapierWebhookCount > 0,
      statusText:
        zapierWebhookCount === 1
          ? "1 zap"
          : zapierWebhookCount === 0
          ? "Not Connected"
          : `${zapierWebhookCount} zaps`,
    },
    {
      connectHref: `/environments/${params.environmentId}/integrations/webhooks`,
      connectText: "Manage Webhooks",
      connectNewTab: false,
      docsHref: "https://getfastform.com/docs/api/management/webhooks",
      docsText: "Docs",
      docsNewTab: true,
      label: "Webhooks",
      description: "Trigger Webhooks based on actions in your forms",
      icon: <Image src={WebhookLogo} alt="Webhook Logo" />,
      connected: userWebhookCount > 0,
      statusText:
        userWebhookCount === 1
          ? "1 webhook"
          : userWebhookCount === 0
          ? "Not Connected"
          : `${userWebhookCount} webhooks`,
    },
    {
      connectHref: `/environments/${params.environmentId}/integrations/google-sheets`,
      connectText: `${containsGoogleSheetIntegration ? "Manage Sheets" : "Connect"}`,
      connectNewTab: false,
      docsHref: "https://getfastform.com/docs/integrations/google-sheets",
      docsText: "Docs",
      docsNewTab: true,
      label: "Google Sheets",
      description: "Instantly populate your spreadsheets with form data",
      icon: <Image src={GoogleSheetsLogo} alt="Google sheets Logo" />,
      connected: containsGoogleSheetIntegration ? true : false,
      statusText: containsGoogleSheetIntegration ? "Connected" : "Not Connected",
    },
    {
      connectHref: `/environments/${params.environmentId}/integrations/airtable`,
      connectText: `${containsAirtableIntegration ? "Manage Table" : "Connect"}`,
      connectNewTab: false,
      docsHref: "https://getfastform.com/docs/integrations/airtable",
      docsText: "Docs",
      docsNewTab: true,
      label: "Airtable",
      description: "Instantly populate your airtable table with form data",
      icon: <Image src={AirtableLogo} alt="Airtable Logo" />,
      connected: containsAirtableIntegration ? true : false,
      statusText: containsAirtableIntegration ? "Connected" : "Not Connected",
    },
    {
      docsHref: "https://getfastform.com/docs/integrations/n8n",
      docsText: "Docs",
      docsNewTab: true,
      connectHref: "https://n8n.io",
      connectText: "Connect",
      connectNewTab: true,
      label: "n8n",
      description: "Integrate Fastform with 350+ apps via n8n",
      icon: <Image src={n8nLogo} alt="n8n Logo" />,
      connected: n8nwebhookCount > 0,
      statusText:
        n8nwebhookCount === 1
          ? "1 integration"
          : n8nwebhookCount === 0
          ? "Not Connected"
          : `${n8nwebhookCount} integrations`,
    },
    {
      docsHref: "https://getfastform.com/docs/integrations/make",
      docsText: "Docs",
      docsNewTab: true,
      connectHref: "https://www.make.com/en/integrations/fastform",
      connectText: "Connect",
      connectNewTab: true,
      label: "Make.com",
      description: "Integrate Fastform with 1000+ apps via Make",
      icon: <Image src={MakeLogo} alt="Make Logo" />,
      connected: makeWebhookCount > 0,
      statusText:
        makeWebhookCount === 1
          ? "1 integration"
          : makeWebhookCount === 0
          ? "Not Connected"
          : `${makeWebhookCount} integration`,
    },
  ];

  if (isViewer) return <ErrorComponent />;

  return (
    <div>
      <h1 className="my-2 text-3xl font-bold text-slate-800">Integrations</h1>
      <p className="mb-6 text-slate-500">Connect Fastform with your favorite tools.</p>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {integrationCards.map((card) => (
          <Card
            key={card.label}
            docsHref={card.docsHref}
            docsText={card.docsText}
            docsNewTab={card.docsNewTab}
            connectHref={card.connectHref}
            connectText={card.connectText}
            connectNewTab={card.connectNewTab}
            label={card.label}
            description={card.description}
            icon={card.icon}
            connected={card.connected}
            statusText={card.statusText}
          />
        ))}
      </div>
    </div>
  );
}
