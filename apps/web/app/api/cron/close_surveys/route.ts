import { responses } from "@/app/lib/api/response";
import { prisma } from "@fastform/database";
import { CRON_SECRET } from "@fastform/lib/constants";
import { headers } from "next/headers";

export async function POST() {
  const headersList = headers();
  const apiKey = headersList.get("x-api-key");

  if (!apiKey || apiKey !== CRON_SECRET) {
    return responses.notAuthenticatedResponse();
  }

  const surveys = await prisma.form.findMany({
    where: {
      status: "inProgress",
      closeOnDate: {
        lte: new Date(),
      },
    },
    select: {
      id: true,
    },
  });

  if (!surveys.length) {
    return responses.successResponse({ message: "No surveys to close" });
  }

  const mutationResp = await prisma.form.updateMany({
    where: {
      id: {
        in: surveys.map((form) => form.id),
      },
    },
    data: {
      status: "completed",
    },
  });

  return responses.successResponse({
    message: `Closed ${mutationResp.count} form(s)`,
  });
}
