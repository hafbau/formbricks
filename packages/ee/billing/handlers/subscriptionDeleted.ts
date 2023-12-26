import { getTeam, updateTeam } from "@fastform/lib/team/service";
import Stripe from "stripe";
import { ProductFeatureKeys, StripeProductNames } from "../lib/constants";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2023-10-16",
});

export const handleSubscriptionDeleted = async (event: Stripe.Event) => {
  const stripeSubscriptionObject = event.data.object as Stripe.Subscription;
  const teamId = stripeSubscriptionObject.metadata.teamId;
  if (!teamId) {
    console.error("No teamId found in subscription");
    return { status: 400, message: "skipping, no teamId found" };
  }

  const team = await getTeam(teamId);
  if (!team) throw new Error("Team not found.");

  let updatedFeatures = team.billing.features;

  for (const item of stripeSubscriptionObject.items.data) {
    const product = await stripe.products.retrieve(item.price.product as string);

    switch (product.name) {
      case StripeProductNames.inAppForm:
        updatedFeatures[ProductFeatureKeys.inAppForm as keyof typeof team.billing.features].status =
          "inactive";
        updatedFeatures[ProductFeatureKeys.inAppForm as keyof typeof team.billing.features].unlimited =
          false;
        break;
      case StripeProductNames.linkForm:
        updatedFeatures[ProductFeatureKeys.linkForm as keyof typeof team.billing.features].status =
          "inactive";
        updatedFeatures[ProductFeatureKeys.linkForm as keyof typeof team.billing.features].unlimited =
          false;
        break;
      case StripeProductNames.userTargeting:
        updatedFeatures[ProductFeatureKeys.userTargeting as keyof typeof team.billing.features].status =
          "inactive";
        updatedFeatures[ProductFeatureKeys.userTargeting as keyof typeof team.billing.features].unlimited =
          false;
        break;
    }
  }

  await updateTeam(teamId, {
    billing: {
      ...team.billing,
      features: updatedFeatures,
    },
  });
};
