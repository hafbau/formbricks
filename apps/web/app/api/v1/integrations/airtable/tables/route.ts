import { authOptions } from "@fastform/lib/authOptions";
import { getTables } from "@fastform/lib/airtable/service";
import { hasUserEnvironmentAccess } from "@fastform/lib/environment/auth";
import { getIntegrationByType } from "@fastform/lib/integration/service";
import { TIntegrationAirtable } from "@fastform/types/integration/airtable";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { responses } from "@/app/lib/api/response";
import * as z from "zod";

export async function GET(req: NextRequest) {
  const url = req.url;
  const environmentId = req.headers.get("environmentId");
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const session = await getServerSession(authOptions);
  const baseId = z.string().safeParse(queryParams.get("baseId"));

  if (!baseId.success) {
    return responses.missingFieldResponse("Base Id is Required");
  }

  if (!session) {
    return responses.notAuthenticatedResponse();
  }

  if (!environmentId) {
    return responses.badRequestResponse("environmentId is missing");
  }

  const canUserAccessEnvironment = await hasUserEnvironmentAccess(session?.user.id, environmentId);
  if (!canUserAccessEnvironment || !environmentId) {
    return responses.unauthorizedResponse();
  }

  const integration = (await getIntegrationByType(environmentId, "airtable")) as TIntegrationAirtable;

  if (!integration) {
    return responses.notFoundResponse("Integration not found", environmentId);
  }

  const tables = await getTables(integration.config.key, baseId.data);
  return responses.successResponse(tables);
}
