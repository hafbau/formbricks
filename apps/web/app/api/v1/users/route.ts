import { sendInviteAcceptedEmail, sendVerificationEmail } from "@/app/lib/email";
import { prisma } from "@fastform/database";
import { EMAIL_VERIFICATION_DISABLED, INVITE_DISABLED, SIGNUP_ENABLED } from "@fastform/lib/constants";
import { verifyInviteToken } from "@fastform/lib/jwt";
import { deleteInvite } from "@fastform/lib/invite/service";
import { createMembership } from "@fastform/lib/membership/service";
import { createProduct } from "@fastform/lib/product/service";
import { createProfile } from "@fastform/lib/profile/service";
import { createTeam } from "@fastform/lib/team/service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let { inviteToken, ...user } = await request.json();
  if (inviteToken ? INVITE_DISABLED : !SIGNUP_ENABLED) {
    return NextResponse.json({ error: "Signup disabled" }, { status: 403 });
  }
  user = { ...user, ...{ email: user.email.toLowerCase() } };

  let inviteId;

  try {
    let invite;

    if (inviteToken) {
      let inviteTokenData = await verifyInviteToken(inviteToken);
      inviteId = inviteTokenData?.inviteId;

      invite = await prisma.invite.findUnique({
        where: { id: inviteId },
        include: {
          creator: true,
        },
      });

      if (!invite) {
        return NextResponse.json({ error: "Invalid invite ID" }, { status: 400 });
      }

      // create a user and assign him to the team

      const profile = await createProfile(user);
      await createMembership(invite.teamId, profile.id, {
        accepted: true,
        role: invite.role,
      });

      if (!EMAIL_VERIFICATION_DISABLED) {
        await sendVerificationEmail(profile);
      }

      await sendInviteAcceptedEmail(invite.creator.name, user.name, invite.creator.email);
      await deleteInvite(inviteId);

      return NextResponse.json(profile);
    } else {
      const team = await createTeam({
        name: `${user.name}'s Team`,
      });
      await createProduct(team.id, { name: "My Product" });
      const profile = await createProfile(user);
      await createMembership(team.id, profile.id, { role: "owner", accepted: true });

      if (!EMAIL_VERIFICATION_DISABLED) {
        await sendVerificationEmail(profile);
      }
      return NextResponse.json(profile);
    }
  } catch (e) {
    if (e.code === "P2002") {
      return NextResponse.json(
        {
          error: "user with this email address already exists",
          errorCode: e.code,
        },
        { status: 409 }
      );
    } else {
      return NextResponse.json(
        {
          error: e.message,
          errorCode: e.code,
        },
        { status: 500 }
      );
    }
  }
}
