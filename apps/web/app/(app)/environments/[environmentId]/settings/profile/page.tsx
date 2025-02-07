export const revalidate = REVALIDATION_INTERVAL;

import { REVALIDATION_INTERVAL } from "@fastform/lib/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@fastform/lib/authOptions";
import SettingsCard from "../components/SettingsCard";
import SettingsTitle from "../components/SettingsTitle";
import { DeleteAccount } from "./components/DeleteAccount";
import { EditName } from "./components/EditName";
import { EditAvatar } from "./components/EditAvatar";
import AccountSecurity from "@/app/(app)/environments/[environmentId]/settings/profile/components/AccountSecurity";
import { getProfile } from "@fastform/lib/profile/service";

export default async function ProfileSettingsPage({ params }: { params: { environmentId: string } }) {
  const { environmentId } = params;
  const session = await getServerSession(authOptions);
  const profile = session && session.user ? await getProfile(session.user.id) : null;

  return (
    <>
      {profile && (
        <div>
          <SettingsTitle title="Profile" />
          <SettingsCard title="Personal Information" description="Update your personal information.">
            <EditName profile={profile} />
          </SettingsCard>
          <SettingsCard title="Avatar" description="Assist your team in identifying you on Fastform.">
            <EditAvatar session={session} environmentId={environmentId} />
          </SettingsCard>
          {profile.identityProvider === "email" && (
            <SettingsCard title="Security" description="Manage your password and other security settings.">
              <AccountSecurity profile={profile} />
            </SettingsCard>
          )}

          <SettingsCard
            title="Delete account"
            description="Delete your account with all of your personal information and data.">
            <DeleteAccount session={session} />
          </SettingsCard>
        </div>
      )}
    </>
  );
}
