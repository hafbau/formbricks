import { authOptions } from "@fastform/lib/authOptions";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { getServerSession } from "next-auth";
import TemplateContainerWithPreview from "./TemplateContainer";

export default async function FormTemplatesPage({ params }) {
  const session = await getServerSession(authOptions);
  const environmentId = params.environmentId;

  const [environment, product] = await Promise.all([
    getEnvironment(environmentId),
    getProductByEnvironmentId(environmentId),
  ]);

  if (!session) {
    throw new Error("Session not found");
  }

  if (!product) {
    throw new Error("Product not found");
  }

  if (!environment) {
    throw new Error("Environment not found");
  }

  return (
    <TemplateContainerWithPreview
      environmentId={environmentId}
      profile={session.user}
      environment={environment}
      product={product}
    />
  );
}
