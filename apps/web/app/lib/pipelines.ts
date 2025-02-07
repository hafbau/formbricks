import { INTERNAL_SECRET, WEBAPP_URL } from "@fastform/lib/constants";
import { TPipelineInput } from "@fastform/types/pipelines";

export async function sendToPipeline({ event, formId, environmentId, response }: TPipelineInput) {
  return fetch(`${WEBAPP_URL}/api/pipeline`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": INTERNAL_SECRET,
    },
    body: JSON.stringify({
      environmentId: environmentId,
      formId: formId,
      event,
      response,
    }),
  }).catch((error) => {
    console.error(`Error sending event to pipeline: ${error}`);
  });
}
