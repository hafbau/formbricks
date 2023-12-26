import { TJsActionInput } from "@fastform/types/js";
import { Tform } from "@fastform/types/forms";
import { Config } from "./config";
import { NetworkError, Result, err, okVoid } from "./errors";
import { Logger } from "./logger";
import { renderWidget } from "./widget";
import { FastformAPI } from "@fastform/api";
const logger = Logger.getInstance();
const config = Config.getInstance();

const intentsToNotCreateOnApp = ["Exit Intent (Desktop)", "50% Scroll"];

export const trackAction = async (
  name: string,
  properties: TJsActionInput["properties"] = {}
): Promise<Result<void, NetworkError>> => {
  const { userId } = config.get();
  const input: TJsActionInput = {
    environmentId: config.get().environmentId,
    userId,
    name,
    properties: properties || {},
  };

  // don't send actions to the backend if the person is not identified
  if (userId && !intentsToNotCreateOnApp.includes(name)) {
    logger.debug(`Sending action "${name}" to backend`);

    const api = new FastformAPI({
      apiHost: config.get().apiHost,
      environmentId: config.get().environmentId,
    });
    const res = await api.client.action.create({
      ...input,
      userId,
    });

    if (!res.ok) {
      return err({
        code: "network_error",
        message: `Error tracking action ${name}`,
        status: 500,
        url: `${config.get().apiHost}/api/v1/client/${config.get().environmentId}/actions`,
        responseMessage: res.error.message,
      });
    }
  }

  logger.debug(`Fastform: Action "${name}" tracked`);

  // get a list of forms that are collecting insights
  const activeforms = config.get().state?.forms;

  if (!!activeforms && activeforms.length > 0) {
    triggerform(name, activeforms);
  } else {
    logger.debug("No active forms to display");
  }

  return okVoid();
};

export const triggerform = (actionName: string, activeforms: Tform[]): void => {
  for (const form of activeforms) {
    for (const trigger of form.triggers) {
      if (trigger === actionName) {
        logger.debug(`Fastform: form ${form.id} triggered by action "${actionName}"`);
        renderWidget(form);
        return;
      }
    }
  }
};
