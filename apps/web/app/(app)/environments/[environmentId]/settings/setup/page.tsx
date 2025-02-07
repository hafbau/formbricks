import EnvironmentNotice from "@fastform/ui/EnvironmentNotice";
import { IS_FASTFORM_CLOUD, WEBAPP_URL } from "@fastform/lib/constants";
import SettingsCard from "../components/SettingsCard";
import SettingsTitle from "../components/SettingsTitle";
import SetupInstructions from "./components/SetupInstructions";
import WidgetStatusIndicator from "@/app/(app)/environments/[environmentId]/components/WidgetStatusIndicator";

export default async function ProfileSettingsPage({ params }) {
  return (
    <>
      <div className="space-y-4">
        <SettingsTitle title="Setup Checklist" />
        <EnvironmentNotice environmentId={params.environmentId} subPageUrl="/settings/setup" />
        <SettingsCard title="Widget Status" description="Check if the Fastform widget is alive and kicking.">
          <WidgetStatusIndicator environmentId={params.environmentId} type="large" />
        </SettingsCard>

        <SettingsCard
          title="How to setup"
          description="Follow these steps to setup the Fastform widget within your app"
          noPadding>
          <SetupInstructions
            environmentId={params.environmentId}
            webAppUrl={WEBAPP_URL}
            isFastformCloud={IS_FASTFORM_CLOUD}
          />
        </SettingsCard>
      </div>
    </>
  );
}
