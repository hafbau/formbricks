"use server";

import { authOptions } from "@fastform/lib/authOptions";
import { getProduct, updateProduct } from "@fastform/lib/product/service";
import { TProductUpdateInput } from "@fastform/types/product";
import { getServerSession } from "next-auth";
import { AuthorizationError } from "@fastform/types/errors";
import { canUserAccessProduct, verifyUserRoleAccess } from "@fastform/lib/product/auth";

export async function updateProductAction(productId: string, inputProduct: Partial<TProductUpdateInput>) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessProduct(session.user.id, productId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const product = await getProduct(productId);

  const { hasCreateOrUpdateAccess } = await verifyUserRoleAccess(product!.teamId, session.user.id);
  if (!hasCreateOrUpdateAccess) throw new AuthorizationError("Not authorized");

  return await updateProduct(productId, inputProduct);
}
