import { responses } from "@/app/lib/api/response";
import { prisma } from "@fastform/database";
import { CRON_SECRET } from "@fastform/lib/constants";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { sendNoLiveformNotificationEmail, sendWeeklySummaryNotificationEmail } from "./email";
import { EnvironmentData, NotificationResponse, ProductData, Form, formResponse } from "./types";

const BATCH_SIZE = 10;

export async function POST(): Promise<NextResponse> {
  // Check authentication
  if (headers().get("x-api-key") !== CRON_SECRET) {
    return responses.notAuthenticatedResponse();
  }

  const emailSendingPromises: Promise<void>[] = [];

  // Fetch all team IDs
  const teamIds = await getTeamIds();

  // Paginate through teams
  for (let i = 0; i < teamIds.length; i += BATCH_SIZE) {
    const batchedTeamIds = teamIds.slice(i, i + BATCH_SIZE);
    // Fetch products for batched teams asynchronously
    const batchedProductsPromises = batchedTeamIds.map((teamId) => getProductsByTeamId(teamId));

    const batchedProducts = await Promise.all(batchedProductsPromises);
    for (const products of batchedProducts) {
      for (const product of products) {
        const teamMembers = product.team.memberships;
        const teamMembersWithNotificationEnabled = teamMembers.filter(
          (member) =>
            member.user.notificationSettings?.weeklySummary &&
            member.user.notificationSettings.weeklySummary[product.id]
        );

        if (teamMembersWithNotificationEnabled.length === 0) continue;

        const notificationResponse = getNotificationResponse(product.environments[0], product.name);

        if (notificationResponse.insights.numLiveform === 0) {
          for (const teamMember of teamMembersWithNotificationEnabled) {
            emailSendingPromises.push(
              sendNoLiveformNotificationEmail(teamMember.user.email, notificationResponse)
            );
          }
          continue;
        }

        for (const teamMember of teamMembersWithNotificationEnabled) {
          emailSendingPromises.push(
            sendWeeklySummaryNotificationEmail(teamMember.user.email, notificationResponse)
          );
        }
      }
    }
  }

  await Promise.all(emailSendingPromises);
  return responses.successResponse({}, true);
}

const getTeamIds = async (): Promise<string[]> => {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
    },
  });
  return teams.map((team) => team.id);
};

const getProductsByTeamId = async (teamId: string): Promise<ProductData[]> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return await prisma.product.findMany({
    where: {
      teamId: teamId,
    },
    select: {
      id: true,
      name: true,
      environments: {
        where: {
          type: "production",
        },
        select: {
          id: true,
          forms: {
            where: {
              NOT: {
                AND: [
                  { status: "completed" },
                  {
                    responses: {
                      none: {
                        createdAt: {
                          gte: sevenDaysAgo,
                        },
                      },
                    },
                  },
                ],
              },
              status: {
                not: "draft",
              },
            },
            select: {
              id: true,
              name: true,
              questions: true,
              status: true,
              responses: {
                where: {
                  createdAt: {
                    gte: sevenDaysAgo,
                  },
                },
                select: {
                  id: true,
                  createdAt: true,
                  updatedAt: true,
                  finished: true,
                  data: true,
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
              displays: {
                where: {
                  createdAt: {
                    gte: sevenDaysAgo,
                  },
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
      team: {
        select: {
          memberships: {
            select: {
              user: {
                select: {
                  email: true,
                  notificationSettings: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const getNotificationResponse = (environment: EnvironmentData, productName: string): NotificationResponse => {
  const insights = {
    totalCompletedResponses: 0,
    totalDisplays: 0,
    totalResponses: 0,
    completionRate: 0,
    numLiveform: 0,
  };

  const forms: Form[] = [];

  // iterate through the forms and calculate the overall insights
  for (const form of environment.forms) {
    const formData: Form = {
      id: form.id,
      name: form.name,
      status: form.status,
      responseCount: form.responses.length,
      responses: [],
    };
    // iterate through the responses and calculate the form insights
    for (const response of form.responses) {
      // only take the first 3 responses
      if (formData.responses.length >= 1) {
        break;
      }
      const formResponse: formResponse = {};
      for (const question of form.questions) {
        const headline = question.headline;
        const answer = response.data[question.id]?.toString() || null;
        if (answer === null || answer === "" || answer?.length === 0) {
          continue;
        }
        formResponse[headline] = answer;
      }
      formData.responses.push(formResponse);
    }
    forms.push(formData);
    // calculate the overall insights
    if (form.status == "inProgress") {
      insights.numLiveform += 1;
    }
    insights.totalCompletedResponses += form.responses.filter((r) => r.finished).length;
    insights.totalDisplays += form.displays.length;
    insights.totalResponses += form.responses.length;
    insights.completionRate = Math.round((insights.totalCompletedResponses / insights.totalResponses) * 100);
  }
  // build the notification response needed for the emails
  const lastWeekDate = new Date();
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  return {
    environmentId: environment.id,
    currentDate: new Date(),
    lastWeekDate,
    productName: productName,
    forms,
    insights,
  };
};
