"use client";

import ShareInviteModal from "@/app/(app)/environments/[environmentId]/settings/members/components/ShareInviteModal";
import {
  createInviteTokenAction,
  deleteInviteAction,
  deleteMembershipAction,
  resendInviteAction,
} from "@/app/(app)/environments/[environmentId]/settings/members/actions";
import { DeleteDialog } from "@fastform/ui/DeleteDialog";
import { TInvite } from "@fastform/types/invites";
import { TMember } from "@fastform/types/memberships";
import { TTeam } from "@fastform/types/teams";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@fastform/ui/Tooltip";
import { PaperAirplaneIcon, ShareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

type MemberActionsProps = {
  team: TTeam;
  member?: TMember;
  invite?: TInvite;
  isAdminOrOwner: boolean;
  showDeleteButton?: boolean;
};

export default function MemberActions({ team, member, invite, showDeleteButton }: MemberActionsProps) {
  const router = useRouter();
  const [isDeleteMemberModalOpen, setDeleteMemberModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showShareInviteModal, setShowShareInviteModal] = useState(false);

  const [shareInviteToken, setShareInviteToken] = useState("");

  const handleDeleteMember = async () => {
    try {
      setIsDeleting(true);
      if (!member && invite) {
        // This is an invite

        await deleteInviteAction(invite?.id, team.id);
        toast.success("Invite deleted successfully");
      }

      if (member && !invite) {
        // This is a member

        await deleteMembershipAction(member.userId, team.id);
        toast.success("Member deleted successfully");
      }

      setIsDeleting(false);
      router.refresh();
    } catch (err) {
      console.log({ err });
      setIsDeleting(false);
      toast.error("Something went wrong");
    }
  };

  const memberName = useMemo(() => {
    if (member) {
      return member.name;
    }

    if (invite) {
      return invite.name;
    }

    return "";
  }, [invite, member]);

  const handleShareInvite = async () => {
    try {
      if (!invite) return;

      const { inviteToken } = await createInviteTokenAction(invite.id);
      setShareInviteToken(inviteToken);
      setShowShareInviteModal(true);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleResendInvite = async () => {
    try {
      if (!invite) return;

      await resendInviteAction(invite.id);
      toast.success("Invitation sent once more.");
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <>
      {showDeleteButton && (
        <button onClick={() => setDeleteMemberModalOpen(true)}>
          <TrashIcon className="h-5 w-5 text-slate-700 hover:text-slate-500" />
        </button>
      )}

      {invite && (
        <TooltipProvider delayDuration={50}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  handleShareInvite();
                }}>
                <ShareIcon className="h-5 w-5 text-slate-700 hover:text-slate-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="TooltipContent" sideOffset={5}>
              Share Invite Link
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  handleResendInvite();
                }}>
                <PaperAirplaneIcon className="h-5 w-5 text-slate-700 hover:text-slate-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="TooltipContent" sideOffset={5}>
              Resend Invitation Email
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <DeleteDialog
        open={isDeleteMemberModalOpen}
        setOpen={setDeleteMemberModalOpen}
        deleteWhat={memberName + " from your team"}
        onDelete={handleDeleteMember}
        isDeleting={isDeleting}
      />

      {showShareInviteModal && (
        <ShareInviteModal
          inviteToken={shareInviteToken}
          open={showShareInviteModal}
          setOpen={setShowShareInviteModal}
        />
      )}
    </>
  );
}
