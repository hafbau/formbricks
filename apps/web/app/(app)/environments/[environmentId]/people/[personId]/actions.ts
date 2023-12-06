"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { getServerSession } from "next-auth";
import { AuthorizationError } from "@fastform/types/errors";
import { deletePerson } from "@fastform/lib/person/service";
import { canUserAccessPerson } from "@fastform/lib/person/auth";

export const deletePersonAction = async (personId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessPerson(session.user.id, personId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  await deletePerson(personId);
};
