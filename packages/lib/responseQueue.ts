import { FastformAPI } from "@fastform/api";
import { TResponseUpdate } from "@fastform/types/responses";
import formState from "./formState";

interface QueueConfig {
  apiHost: string;
  environmentId: string;
  retryAttempts: number;
  onResponseSendingFailed?: (responseUpdate: TResponseUpdate) => void;
  setformState?: (state: formState) => void;
}

export class ResponseQueue {
  private queue: TResponseUpdate[] = [];
  private config: QueueConfig;
  private formState: formState;
  private isRequestInProgress = false;
  private api: FastformAPI;

  constructor(config: QueueConfig, formState: formState) {
    this.config = config;
    this.formState = formState;
    this.api = new FastformAPI({
      apiHost: config.apiHost,
      environmentId: config.environmentId,
    });
  }

  add(responseUpdate: TResponseUpdate) {
    // update form state
    this.formState.accumulateResponse(responseUpdate);
    if (this.config.setformState) {
      this.config.setformState(this.formState);
    }
    // add response to queue
    this.queue.push(responseUpdate);
    this.processQueue();
  }

  async processQueue() {
    if (this.isRequestInProgress) return;
    if (this.queue.length === 0) return;

    this.isRequestInProgress = true;

    const responseUpdate = this.queue[0];
    let attempts = 0;

    while (attempts < this.config.retryAttempts) {
      const success = await this.sendResponse(responseUpdate);
      if (success) {
        this.queue.shift(); // remove the successfully sent response from the queue
        break; // exit the retry loop
      }
      console.error("Fastform: Failed to send response. Retrying...", attempts);
      attempts++;
    }

    if (attempts >= this.config.retryAttempts) {
      // Inform the user after 2 failed attempts
      console.error("Failed to send response after 2 attempts.");
      // If the response is finished and thus fails finally, inform the user
      if (this.formState.responseAcc.finished && this.config.onResponseSendingFailed) {
        this.config.onResponseSendingFailed(this.formState.responseAcc);
      }
      this.queue.shift(); // remove the failed response from the queue
    }

    this.isRequestInProgress = false;
    this.processQueue(); // process the next item in the queue if any
  }

  async sendResponse(responseUpdate: TResponseUpdate): Promise<boolean> {
    try {
      if (this.formState.responseId !== null) {
        await this.api.client.response.update({ ...responseUpdate, responseId: this.formState.responseId });
      } else {
        const response = await this.api.client.response.create({
          ...responseUpdate,
          formId: this.formState.formId,
          userId: this.formState.userId || null,
          singleUseId: this.formState.singleUseId || null,
        });
        if (!response.ok) {
          throw new Error("Could not create response");
        }
        if (this.formState.displayId) {
          await this.api.client.display.update(this.formState.displayId, { responseId: response.data.id });
        }
        this.formState.updateResponseId(response.data.id);
        if (this.config.setformState) {
          this.config.setformState(this.formState);
        }
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // update formState
  updateformState(formState: formState) {
    this.formState = formState;
  }
}
