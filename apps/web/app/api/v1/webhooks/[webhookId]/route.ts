import { responses } from "@/app/lib/api/response";
import { getApiKeyFromKey } from "@fastform/lib/apiKey/service";
import { deleteWebhook, getWebhook } from "@fastform/lib/webhook/service";
import { headers } from "next/headers";

export async function GET(_: Request, { params }: { params: { webhookId: string } }) {
  const apiKey = headers().get("x-api-key");
  if (!apiKey) {
    return responses.notAuthenticatedResponse();
  }
  const apiKeyData = await getApiKeyFromKey(apiKey);
  if (!apiKeyData) {
    return responses.notAuthenticatedResponse();
  }

  // add webhook to database
  const webhook = await getWebhook(params.webhookId);
  if (!webhook) {
    return responses.notFoundResponse("Webhook", params.webhookId);
  }
  if (webhook.environmentId !== apiKeyData.environmentId) {
    return responses.unauthorizedResponse();
  }
  return responses.successResponse(webhook);
}

export async function DELETE(_: Request, { params }: { params: { webhookId: string } }) {
  const apiKey = headers().get("x-api-key");
  if (!apiKey) {
    return responses.notAuthenticatedResponse();
  }
  const apiKeyData = await getApiKeyFromKey(apiKey);
  if (!apiKeyData) {
    return responses.notAuthenticatedResponse();
  }

  // check if webhook exists
  const webhook = await getWebhook(params.webhookId);
  if (!webhook) {
    return responses.notFoundResponse("Webhook", params.webhookId);
  }
  if (webhook.environmentId !== apiKeyData.environmentId) {
    return responses.unauthorizedResponse();
  }

  // delete webhook from database
  try {
    const webhook = await deleteWebhook(params.webhookId);
    return responses.successResponse(webhook);
  } catch (e) {
    console.error(e.message);
    return responses.notFoundResponse("Webhook", params.webhookId);
  }
}
