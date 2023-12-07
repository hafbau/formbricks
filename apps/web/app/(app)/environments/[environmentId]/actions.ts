"use server";

import { prisma } from "@fastform/database";
import { authOptions } from "@fastform/lib/authOptions";
import { SHORT_URL_BASE, WEBAPP_URL } from "@fastform/lib/constants";
import { hasUserEnvironmentAccess } from "@fastform/lib/environment/auth";
import { createMembership } from "@fastform/lib/membership/service";
import { createProduct } from "@fastform/lib/product/service";
import { createShortUrl } from "@fastform/lib/shortUrl/service";
import { canUserAccessform, verifyUserRoleAccess } from "@fastform/lib/form/auth";
import { formCache } from "@fastform/lib/form/cache";
import { deleteform, duplicateform, getform } from "@fastform/lib/form/service";
import { createTeam, getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { AuthenticationError, AuthorizationError, ResourceNotFoundError } from "@fastform/types/errors";
import { Team } from "@prisma/client";
import { Prisma as prismaClient } from "@prisma/client/";
import { getServerSession } from "next-auth";

export const createShortUrlAction = async (url: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthenticationError("Not authenticated");

  const regexPattern = new RegExp("^" + WEBAPP_URL);
  const isValidUrl = regexPattern.test(url);

  if (!isValidUrl) throw new Error("Only Fastform form URLs are allowed");

  const shortUrl = await createShortUrl(url);
  const fullShortUrl = SHORT_URL_BASE + "/" + shortUrl.id;
  return fullShortUrl;
};

export async function createTeamAction(teamName: string): Promise<Team> {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const newTeam = await createTeam({
    name: teamName,
  });

  await createMembership(newTeam.id, session.user.id, {
    role: "owner",
    accepted: true,
  });

  await createProduct(newTeam.id, {
    name: "My Product",
  });

  return newTeam;
}

export async function duplicateformAction(environmentId: string, formId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessform(session.user.id, formId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const duplicatedform = await duplicateform(environmentId, formId);
  return duplicatedform;
}

export async function copyToOtherEnvironmentAction(
  environmentId: string,
  formId: string,
  targetEnvironmentId: string
) {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorizedToAccessSourceEnvironment = await hasUserEnvironmentAccess(
    session.user.id,
    environmentId
  );
  if (!isAuthorizedToAccessSourceEnvironment) throw new AuthorizationError("Not authorized");

  const isAuthorizedToAccessTargetEnvironment = await hasUserEnvironmentAccess(
    session.user.id,
    targetEnvironmentId
  );
  if (!isAuthorizedToAccessTargetEnvironment) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessform(session.user.id, formId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const existingform = await prisma.form.findFirst({
    where: {
      id: formId,
      environmentId,
    },
    include: {
      triggers: {
        include: {
          actionClass: true,
        },
      },
      attributeFilters: {
        include: {
          attributeClass: true,
        },
      },
    },
  });

  if (!existingform) {
    throw new ResourceNotFoundError("Form", formId);
  }

  let targetEnvironmentTriggers: string[] = [];
  // map the local triggers to the target environment
  for (const trigger of existingform.triggers) {
    const targetEnvironmentTrigger = await prisma.actionClass.findFirst({
      where: {
        name: trigger.actionClass.name,
        environment: {
          id: targetEnvironmentId,
        },
      },
    });
    if (!targetEnvironmentTrigger) {
      // if the trigger does not exist in the target environment, create it
      const newTrigger = await prisma.actionClass.create({
        data: {
          name: trigger.actionClass.name,
          environment: {
            connect: {
              id: targetEnvironmentId,
            },
          },
          description: trigger.actionClass.description,
          type: trigger.actionClass.type,
          noCodeConfig: trigger.actionClass.noCodeConfig
            ? JSON.parse(JSON.stringify(trigger.actionClass.noCodeConfig))
            : undefined,
        },
      });
      targetEnvironmentTriggers.push(newTrigger.id);
    } else {
      targetEnvironmentTriggers.push(targetEnvironmentTrigger.id);
    }
  }

  let targetEnvironmentAttributeFilters: string[] = [];
  // map the local attributeFilters to the target env
  for (const attributeFilter of existingform.attributeFilters) {
    // check if attributeClass exists in target env.
    // if not, create it
    const targetEnvironmentAttributeClass = await prisma.attributeClass.findFirst({
      where: {
        name: attributeFilter.attributeClass.name,
        environment: {
          id: targetEnvironmentId,
        },
      },
    });
    if (!targetEnvironmentAttributeClass) {
      const newAttributeClass = await prisma.attributeClass.create({
        data: {
          name: attributeFilter.attributeClass.name,
          description: attributeFilter.attributeClass.description,
          type: attributeFilter.attributeClass.type,
          environment: {
            connect: {
              id: targetEnvironmentId,
            },
          },
        },
      });
      targetEnvironmentAttributeFilters.push(newAttributeClass.id);
    } else {
      targetEnvironmentAttributeFilters.push(targetEnvironmentAttributeClass.id);
    }
  }

  // create new form with the data of the existing form
  const newform = await prisma.form.create({
    data: {
      ...existingform,
      id: undefined, // id is auto-generated
      environmentId: undefined, // environmentId is set below
      name: `${existingform.name} (copy)`,
      status: "draft",
      questions: JSON.parse(JSON.stringify(existingform.questions)),
      thankYouCard: JSON.parse(JSON.stringify(existingform.thankYouCard)),
      triggers: {
        create: targetEnvironmentTriggers.map((actionClassId) => ({
          actionClassId: actionClassId,
        })),
      },
      attributeFilters: {
        create: existingform.attributeFilters.map((attributeFilter, idx) => ({
          attributeClassId: targetEnvironmentAttributeFilters[idx],
          condition: attributeFilter.condition,
          value: attributeFilter.value,
        })),
      },
      environment: {
        connect: {
          id: targetEnvironmentId,
        },
      },
      formClosedMessage: existingform.formClosedMessage ?? prismaClient.JsonNull,
      singleUse: existingform.singleUse ?? prismaClient.JsonNull,
      productOverwrites: existingform.productOverwrites ?? prismaClient.JsonNull,
      verifyEmail: existingform.verifyEmail ?? prismaClient.JsonNull,
      styling: existingform.styling ?? prismaClient.JsonNull,
    },
  });

  formCache.revalidate({
    id: newform.id,
    environmentId: targetEnvironmentId,
  });
  return newform;
}

export const deleteformAction = async (formId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessform(session.user.id, formId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const form = await getform(formId);

  const { hasDeleteAccess } = await verifyUserRoleAccess(form!.environmentId, session.user.id);
  if (!hasDeleteAccess) throw new AuthorizationError("Not authorized");

  await deleteform(formId);
};

export const createProductAction = async (environmentId: string, productName: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await hasUserEnvironmentAccess(session.user.id, environmentId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const team = await getTeamByEnvironmentId(environmentId);
  if (!team) throw new ResourceNotFoundError("Team from environment", environmentId);

  const product = await createProduct(team.id, {
    name: productName,
  });

  // get production environment
  const productionEnvironment = product.environments.find((environment) => environment.type === "production");
  if (!productionEnvironment) throw new ResourceNotFoundError("Production environment", environmentId);

  return productionEnvironment;
};
