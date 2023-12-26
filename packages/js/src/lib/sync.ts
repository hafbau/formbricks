import { TJsState, TJsStateSync, TJsSyncParams } from "@fastform/types/js";
import { Config } from "./config";
import { NetworkError, Result, err, ok } from "./errors";
import { Logger } from "./logger";

const config = Config.getInstance();
const logger = Logger.getInstance();

let syncIntervalId: number | null = null;

const diffInDays = (date1: Date, date2: Date) => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const syncWithBackend = async ({
  apiHost,
  environmentId,
  userId,
}: TJsSyncParams): Promise<Result<TJsStateSync, NetworkError>> => {
  const url = `${apiHost}/api/v1/client/${environmentId}/in-app/sync/${userId}`;
  const publicUrl = `${apiHost}/api/v1/client/${environmentId}/in-app/sync`;

  // if user id is available

  if (!userId) {
    // public form
    const response = await fetch(publicUrl);

    if (!response.ok) {
      const jsonRes = await response.json();

      return err({
        code: "network_error",
        status: response.status,
        message: "Error syncing with backend",
        url,
        responseMessage: jsonRes.message,
      });
    }

    return ok((await response.json()).data as TJsState);
  }

  // userId is available, call the api with the `userId` param

  const response = await fetch(url);

  if (!response.ok) {
    const jsonRes = await response.json();

    return err({
      code: "network_error",
      status: response.status,
      message: "Error syncing with backend",
      url,
      responseMessage: jsonRes.message,
    });
  }

  const data = await response.json();
  const { data: state } = data;

  return ok(state as TJsStateSync);
};

export const sync = async (params: TJsSyncParams): Promise<void> => {
  try {
    const syncResult = await syncWithBackend(params);
    if (syncResult?.ok !== true) {
      logger.error(`Sync failed: ${JSON.stringify(syncResult.error)}`);
      throw syncResult.error;
    }

    let oldState: TJsState | undefined;
    try {
      oldState = config.get().state;
    } catch (e) {
      // ignore error
    }

    let state: TJsState = {
      forms: syncResult.value.forms,
      noCodeActionClasses: syncResult.value.noCodeActionClasses,
      product: syncResult.value.product,
      attributes: oldState?.attributes || {},
    };

    if (!params.userId) {
      // unidentified user
      // set the displays and filter out forms
      state = {
        ...state,
        displays: oldState?.displays || [],
      };
      state = filterPublicForms(state);

      const formNames = state.forms.map((s) => s.name);
      logger.debug("Fetched " + formNames.length + " forms during sync: " + formNames.join(", "));
    } else {
      const formNames = state.forms.map((s) => s.name);
      logger.debug("Fetched " + formNames.length + " forms during sync: " + formNames.join(", "));
    }

    config.update({
      apiHost: params.apiHost,
      environmentId: params.environmentId,
      userId: params.userId,
      state,
    });

    // before finding the forms, check for public use
  } catch (error) {
    logger.error(`Error during sync: ${error}`);
    throw error;
  }
};

export const filterPublicForms = (state: TJsState): TJsState => {
  const { displays, product } = state;

  let { forms } = state;

  if (!displays) {
    return state;
  }

  // filter forms that meet the displayOption criteria
  let filteredforms = forms.filter((form) => {
    if (form.displayOption === "respondMultiple") {
      return true;
    } else if (form.displayOption === "displayOnce") {
      return displays.filter((display) => display.formId === form.id).length === 0;
    } else if (form.displayOption === "displayMultiple") {
      return displays.filter((display) => display.formId === form.id && display.responded).length === 0;
    } else {
      throw Error("Invalid displayOption");
    }
  });

  const latestDisplay = displays.length > 0 ? displays[displays.length - 1] : undefined;

  // filter forms that meet the recontactDays criteria
  filteredforms = filteredforms.filter((form) => {
    if (!latestDisplay) {
      return true;
    } else if (form.recontactDays !== null) {
      const lastDisplayform = displays.filter((display) => display.formId === form.id)[0];
      if (!lastDisplayform) {
        return true;
      }
      return diffInDays(new Date(), new Date(lastDisplayform.createdAt)) >= form.recontactDays;
    } else if (product.recontactDays !== null) {
      return diffInDays(new Date(), new Date(latestDisplay.createdAt)) >= product.recontactDays;
    } else {
      return true;
    }
  });

  return {
    ...state,
    forms: filteredforms,
  };
};

export const addExpiryCheckListener = (): void => {
  const updateInterval = 1000 * 60; // every minute
  // add event listener to check sync with backend on regular interval
  if (typeof window !== "undefined" && syncIntervalId === null) {
    syncIntervalId = window.setInterval(async () => {
      // check if the config has not expired yet
      if (config.get().expiresAt && new Date(config.get().expiresAt) >= new Date()) {
        return;
      }
      logger.debug("Config has expired. Starting sync.");
      await sync({
        apiHost: config.get().apiHost,
        environmentId: config.get().environmentId,
        userId: config.get().userId,
        // personId: config.get().state?.person?.id,
      });
    }, updateInterval);
  }
};

export const removeExpiryCheckListener = (): void => {
  if (typeof window !== "undefined" && syncIntervalId !== null) {
    window.clearInterval(syncIntervalId);

    syncIntervalId = null;
  }
};
