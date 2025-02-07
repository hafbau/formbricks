import { getSessionUser } from "@/app/lib/api/apiHelper";
import { prisma } from "@fastform/database";
import { NextResponse } from "next/server";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return new Response("Not authenticated", {
      status: 401,
    });
  }

  // get memberships
  const memberships = await prisma.membership.findMany({
    where: {
      userId: sessionUser.id,
    },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          products: {
            select: {
              id: true,
              name: true,
              environments: {
                select: {
                  id: true,
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(memberships);
}
