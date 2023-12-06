"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { canUserAccessProduct, verifyUserRoleAccess } from "@fastform/lib/product/auth";
import { getProduct, updateProduct } from "@fastform/lib/product/service";
import { updateProfile } from "@fastform/lib/profile/service";
import { AuthorizationError } from "@fastform/types/errors";
import { TProductUpdateInput } from "@fastform/types/product";
import { TProfileUpdateInput } from "@fastform/types/profile";
import { getServerSession } from "next-auth";

export async function updateProfileAction(updatedProfile: TProfileUpdateInput) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  return await updateProfile(session.user.id, updatedProfile);
}

export async function updateProductAction(productId: string, updatedProduct: Partial<TProductUpdateInput>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessProduct(session.user.id, productId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const product = await getProduct(productId);

  const { hasCreateOrUpdateAccess } = await verifyUserRoleAccess(product!.teamId, session.user.id);
  if (!hasCreateOrUpdateAccess) throw new AuthorizationError("Not authorized");

  return await updateProduct(productId, updatedProduct);
}
