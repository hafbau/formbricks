"use server";

import { getEmailTemplateHtml } from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/lib/emailTemplate";
import { generateformSingleUseId } from "@/app/lib/singleUseforms";
import { authOptions } from "@fastform/lib/authOptions";
import { sendEmbedformPreviewEmail } from "@fastform/lib/emails/emails";
import { canUserAccessform } from "@fastform/lib/form/auth";
import { AuthenticationError, AuthorizationError } from "@fastform/types/errors";
import { getServerSession } from "next-auth";

type TSendEmailActionArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function generateSingleUseIdAction(formId: string, isEncrypted: boolean): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const hasUserformAccess = await canUserAccessform(session.user.id, formId);

  if (!hasUserformAccess) throw new AuthorizationError("Not authorized");

  return generateformSingleUseId(isEncrypted);
}

export const sendEmailAction = async ({ html, subject, to }: TSendEmailActionArgs) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new AuthenticationError("Not authenticated");
  }
  return await sendEmbedformPreviewEmail(to, subject, html);
};

export const getEmailHtmlAction = async (formId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const hasUserformAccess = await canUserAccessform(session.user.id, formId);
  if (!hasUserformAccess) throw new AuthorizationError("Not authorized");

  return await getEmailTemplateHtml(formId);
};
