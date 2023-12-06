import { sendInviteAcceptedEmail } from "@/app/lib/email";
import { verifyInviteToken } from "@fastform/lib/jwt";
import { authOptions } from "@fastform/lib/authOptions";
import { getServerSession } from "next-auth";
import {
  NotLoggedInContent,
  WrongAccountContent,
  ExpiredContent,
  UsedContent,
  RightAccountContent,
} from "./components/InviteContentComponents";
import { env } from "@fastform/lib/env.mjs";
import { deleteInvite, getInvite } from "@fastform/lib/invite/service";
import { createMembership } from "@fastform/lib/membership/service";

export default async function JoinTeam({ searchParams }) {
  const currentUser = await getServerSession(authOptions);

  try {
    const { inviteId, email } = verifyInviteToken(searchParams.token);

    const invite = await getInvite(inviteId);

    const isInviteExpired = new Date(invite.expiresAt) < new Date();

    if (!invite || isInviteExpired) {
      return <ExpiredContent />;
    } else if (invite.accepted) {
      return <UsedContent />;
    } else if (!currentUser) {
      const redirectUrl = env.NEXTAUTH_URL + "/invite?token=" + searchParams.token;
      return <NotLoggedInContent email={email} token={searchParams.token} redirectUrl={redirectUrl} />;
    } else if (currentUser.user?.email !== email) {
      return <WrongAccountContent />;
    } else {
      await createMembership(invite.teamId, currentUser.user.id, { accepted: true, role: invite.role });
      await deleteInvite(inviteId);

      sendInviteAcceptedEmail(invite.creator.name ?? "", currentUser.user?.name, invite.creator.email);

      return <RightAccountContent />;
    }
  } catch (e) {
    return <ExpiredContent />;
  }
}
