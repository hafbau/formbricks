import { FormbricksAPI } from "@fastform/api";
import { Config } from "./config";

export const getApi = (): FormbricksAPI => {
  const config = Config.getInstance();
  const { environmentId, apiHost } = config.get();

  if (!environmentId || !apiHost) {
    throw new Error("fastform.init() must be called before getApi()");
  }

  return new FormbricksAPI({
    apiHost,
    environmentId,
  });
};
