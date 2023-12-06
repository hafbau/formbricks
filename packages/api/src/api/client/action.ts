import { Result } from "@fastform/types/errorHandlers";
import { NetworkError } from "@fastform/types/errors";
import { TActionInput } from "@fastform/types/actions";
import { makeRequest } from "../../utils/makeRequest";

export class ActionAPI {
  private apiHost: string;
  private environmentId: string;

  constructor(apiHost: string, environmentId: string) {
    this.apiHost = apiHost;
    this.environmentId = environmentId;
  }

  async create(actionInput: Omit<TActionInput, "environmentId">): Promise<Result<{}, NetworkError | Error>> {
    return makeRequest(this.apiHost, `/api/v1/client/${this.environmentId}/actions`, "POST", actionInput);
  }
}
