import { authOptions } from "@fastform/lib/authOptions";
import { hasTeamAccess } from "@/app/lib/api/apiHelper";
import { getEnvironments } from "@fastform/lib/environment/service";
import { getProduct } from "@fastform/lib/product/service";
import { AuthenticationError, AuthorizationError } from "@fastform/types/errors";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export async function GET(_: Request, context: { params: { productId: string } }) {
  const productId = context?.params?.productId;
  if (!productId) return notFound();
  // check auth
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthenticationError("Not authenticated");
  const product = await getProduct(productId);
  if (!product) return notFound();
  const hasAccess = await hasTeamAccess(session.user, product.teamId);
  if (!hasAccess) throw new AuthorizationError("Unauthorized");
  // redirect to product's production environment
  const environments = await getEnvironments(product.id);
  const prodEnvironment = environments.find((e) => e.type === "production");
  if (!prodEnvironment) return notFound();
  redirect(`/environments/${prodEnvironment.id}/`);
}
