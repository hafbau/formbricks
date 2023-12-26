import { ApiConfig } from "./types/index";
import { Client } from "./api/client";

export class FastformAPI {
  client: Client;

  constructor(options: ApiConfig) {
    this.client = new Client(options);
  }
}
