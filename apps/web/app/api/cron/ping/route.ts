import { responses } from "@/app/lib/api/response";
import { CRON_SECRET } from "@fastform/lib/constants";
import { captureTelemetry } from "@fastform/lib/telemetry";
import { headers } from "next/headers";

export async function POST() {
  const headersList = headers();
  const apiKey = headersList.get("x-api-key");

  if (!apiKey || apiKey !== CRON_SECRET) {
    return responses.notAuthenticatedResponse();
  }

  captureTelemetry("ping");

  return responses.successResponse({}, true);
}
