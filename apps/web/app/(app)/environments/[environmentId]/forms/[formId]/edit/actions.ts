"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { canUserAccessform, verifyUserRoleAccess } from "@fastform/lib/form/auth";
import { deleteform, getform, updateform } from "@fastform/lib/form/service";
import { formatformDateFields } from "@fastform/lib/form/util";
import { AuthorizationError } from "@fastform/types/errors";
import { Tform } from "@fastform/types/forms";
import { getServerSession } from "next-auth";

export async function updateformAction(form: Tform): Promise<Tform> {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessform(session.user.id, form.id);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const { hasCreateOrUpdateAccess } = await verifyUserRoleAccess(form.environmentId, session.user.id);
  if (!hasCreateOrUpdateAccess) throw new AuthorizationError("Not authorized");

  const _form = {
    ...form,
    ...formatformDateFields(form),
  };

  return await updateform(_form);
}

export const deleteformAction = async (formId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessform(session.user.id, formId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const form = await getform(formId);
  const { hasDeleteAccess } = await verifyUserRoleAccess(form!.environmentId, session.user.id);
  if (!hasDeleteAccess) throw new AuthorizationError("Not authorized");

  await deleteform(formId);
};
