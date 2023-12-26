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

export const handleCheckoutSessionCompleted = async (event: Stripe.Event) => {
  const checkoutSession = event.data.object as Stripe.Checkout.Session;
  const stripeSubscriptionObject = await stripe.subscriptions.retrieve(
    checkoutSession.subscription as string
  );

  const { customer: stripeCustomer } = (await stripe.checkout.sessions.retrieve(checkoutSession.id, {
    expand: ["customer"],
  })) as { customer: Stripe.Customer };

  const team = await getTeam(stripeSubscriptionObject.metadata.teamId);
  if (!team) throw new Error("Team not found.");
  let updatedFeatures = team.billing.features;

  for (const item of stripeSubscriptionObject.items.data) {
    const product = await stripe.products.retrieve(item.price.product as string);

    switch (product.name) {
      case StripeProductNames.inAppForm:
        updatedFeatures.inAppForm.status = "active";
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
        updatedFeatures.linkForm.status = "active";
        if (item.price.lookup_key === StripePriceLookupKeys.linkFormUnlimited) {
          updatedFeatures.linkForm.unlimited = true;
        }
        break;

      case StripeProductNames.userTargeting:
        updatedFeatures.userTargeting.status = "active";
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

  await updateTeam(team.id, {
    billing: {
      stripeCustomerId: stripeCustomer.id,
      features: updatedFeatures,
    },
  });

  await stripe.customers.update(stripeCustomer.id, {
    name: team.name,
    metadata: { team: team.id },
    invoice_settings: {
      default_payment_method: stripeSubscriptionObject.default_payment_method as string,
    },
  });
};
