import {
  getMonthlyActiveTeamPeopleCount,
  getMonthlyTeamResponseCount,
  getTeam,
  updateTeam,
} from "@fastform/lib/team/service";
import Stripe from "stripe";
import { StripePriceLookupKeys, ProductFeatureKeys, StripeProductNames } from "../lib/constants";
import { reportUsage } from "../lib/reportUsage";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2023-10-16",
});

export const handleSubscriptionUpdatedOrCreated = async (event: Stripe.Event) => {
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
        if (
          !(
            stripeSubscriptionObject.cancel_at_period_end &&
            team.billing.features.inAppForm.status === "cancelled"
          )
        ) {
          updatedFeatures.inAppForm.status = "active";
        }
        if (item.price.lookup_key === StripePriceLookupKeys.inAppFormUnlimited) {
          updatedFeatures.inAppForm.unlimited = true;
        } else {
          const countForTeam = await getMonthlyTeamResponseCount(team.id);

          await reportUsage(
            stripeSubscriptionObject.items.data,
            ProductFeatureKeys.inAppForm,
            countForTeam
          );
        }
        break;

      case StripeProductNames.linkForm:
        if (
          !(
            stripeSubscriptionObject.cancel_at_period_end &&
            team.billing.features.linkForm.status === "cancelled"
          )
        ) {
          updatedFeatures.linkForm.status = "active";
        }
        if (item.price.lookup_key === StripePriceLookupKeys.linkFormUnlimited) {
          updatedFeatures.linkForm.unlimited = true;
        }
        break;
      case StripeProductNames.userTargeting:
        if (
          !(
            stripeSubscriptionObject.cancel_at_period_end &&
            team.billing.features.userTargeting.status === "cancelled"
          )
        ) {
          updatedFeatures.userTargeting.status = "active";
        }
        if (item.price.lookup_key === StripePriceLookupKeys.userTargetingUnlimited) {
          updatedFeatures.userTargeting.unlimited = true;
        } else {
          const countForTeam = await getMonthlyActiveTeamPeopleCount(team.id);

          await reportUsage(
            stripeSubscriptionObject.items.data,
            ProductFeatureKeys.userTargeting,
            countForTeam
          );
        }
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
