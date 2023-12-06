import { Result } from "@fastform/types/errorHandlers";
import { NetworkError } from "@fastform/types/errors";
import { TPersonUpdateInput } from "@fastform/types/people";
import { makeRequest } from "../../utils/makeRequest";

export class PeopleAPI {
  private apiHost: string;
  private environmentId: string;

  constructor(apiHost: string, environmentId: string) {
    this.apiHost = apiHost;
    this.environmentId = environmentId;
  }

  async create(userId: string): Promise<Result<{}, NetworkError | Error>> {
    return makeRequest(this.apiHost, `/api/v1/client/${this.environmentId}/people`, "POST", {
      environmentId: this.environmentId,
      userId,
    });
  }

  async update(userId: string, personInput: TPersonUpdateInput): Promise<Result<{}, NetworkError | Error>> {
    return makeRequest(
      this.apiHost,
      `/api/v1/client/${this.environmentId}/people/${userId}`,
      "POST",
      personInput
    );
  }
}
