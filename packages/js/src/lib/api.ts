import { FastformAPI } from "@fastform/api";
import { Config } from "./config";

export const getApi = (): FastformAPI => {
  const config = Config.getInstance();
  const { environmentId, apiHost } = config.get();

  if (!environmentId || !apiHost) {
    throw new Error("fastform.init() must be called before getApi()");
  }

  return new FastformAPI({
    apiHost,
    environmentId,
  });
};
