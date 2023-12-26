import { getActionClasses } from "@fastform/lib/actionClass/service";
import {
  IS_FASTFORM_CLOUD,
  MAU_LIMIT,
  PRICING_APPFORMS_FREE_RESPONSES,
  PRICING_USERTARGETING_FREE_MTU,
} from "@fastform/lib/constants";
import { getEnvironment } from "@fastform/lib/environment/service";
import { getPerson } from "@fastform/lib/person/service";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { getforms, getSyncforms } from "@fastform/lib/form/service";
import {
  getMonthlyActiveTeamPeopleCount,
  getMonthlyTeamResponseCount,
  getTeamByEnvironmentId,
} from "@fastform/lib/team/service";
import { TEnvironment } from "@fastform/types/environment";
import { TJsLegacyState, TFormWithTriggers } from "@fastform/types/js";
import { TPerson } from "@fastform/types/people";
import { TForm } from "@fastform/types/forms";

export const transformLegacyforms = (forms: TForm[]): TFormWithTriggers[] => {
  const updatedforms = forms.map((form) => {
    const updatedform: any = { ...form };
    updatedform.triggers = updatedform.triggers.map((trigger) => ({ name: trigger }));
    return updatedform;
  });
  return updatedforms;
};

export const getUpdatedState = async (environmentId: string, personId?: string): Promise<TJsLegacyState> => {
  let environment: TEnvironment | null;
  let person: TPerson | {};
  const session = {};

  // check if environment exists
  environment = await getEnvironment(environmentId);

  if (!environment) {
    throw new Error("Environment does not exist");
  }

  // check team subscriptons
  const team = await getTeamByEnvironmentId(environmentId);

  if (!team) {
    throw new Error("Team does not exist");
  }

  // check if Monthly Active Users limit is reached
  if (IS_FASTFORM_CLOUD) {
    const hasUserTargetingSubscription =
      team?.billing?.features.userTargeting.status &&
      team?.billing?.features.userTargeting.status in ["active", "canceled"];
    const currentMau = await getMonthlyActiveTeamPeopleCount(team.id);
    const isMauLimitReached = !hasUserTargetingSubscription && currentMau >= PRICING_USERTARGETING_FREE_MTU;
    if (isMauLimitReached) {
      const errorMessage = `Monthly Active Users limit reached in ${environmentId} (${currentMau}/${MAU_LIMIT})`;
      if (!personId) {
        // don't allow new people or sessions
        throw new Error(errorMessage);
      }
    }
  }

  if (!personId) {
    // create a new person
    person = { id: "legacy" };
  } else {
    // check if person exists
    const existingPerson = await getPerson(personId);
    if (existingPerson) {
      person = existingPerson;
    } else {
      person = { id: "legacy" };
    }
  }
  // check if App Form limit is reached
  let isAppformLimitReached = false;
  if (IS_FASTFORM_CLOUD) {
    const hasAppformSubscription =
      team?.billing?.features.inAppForm.status &&
      team?.billing?.features.inAppForm.status in ["active", "canceled"];
    const monthlyResponsesCount = await getMonthlyTeamResponseCount(team.id);
    isAppformLimitReached =
      IS_FASTFORM_CLOUD &&
      !hasAppformSubscription &&
      monthlyResponsesCount >= PRICING_APPFORMS_FREE_RESPONSES;
  }

  const isPerson = Object.keys(person).length > 0;

  let forms;
  if (isAppformLimitReached) {
    forms = [];
  } else if (isPerson) {
    forms = await getSyncforms(environmentId, person as TPerson);
  } else {
    forms = await getforms(environmentId);
    forms = forms.filter((form) => form.type === "web" && form.status === "inProgress");
  }

  forms = transformLegacyforms(forms);

  // get/create rest of the state
  const [noCodeActionClasses, product] = await Promise.all([
    getActionClasses(environmentId),
    getProductByEnvironmentId(environmentId),
  ]);

  if (!product) {
    throw new Error("Product not found");
  }

  // return state
  const state: TJsLegacyState = {
    person,
    session,
    forms,
    noCodeActionClasses: noCodeActionClasses.filter((actionClass) => actionClass.type === "noCode"),
    product,
  };

  return state;
};
