"use server";
import "server-only";

import { prisma } from "@fastform/database";
import {
  TAttributeClass,
  TAttributeClassUpdateInput,
  ZAttributeClassUpdateInput,
  TAttributeClassType,
  ZAttributeClassType,
} from "@fastform/types/attributeClasses";
import { ZId } from "@fastform/types/environment";
import { validateInputs } from "../utils/validate";
import { DatabaseError } from "@fastform/types/errors";
import { unstable_cache } from "next/cache";
import { SERVICES_REVALIDATION_INTERVAL, ITEMS_PER_PAGE } from "../constants";
import { ZOptionalNumber, ZString } from "@fastform/types/common";
import { attributeClassCache } from "./cache";
import { formatAttributeClassDateFields } from "./util";

export const getAttributeClass = async (attributeClassId: string): Promise<TAttributeClass | null> => {
  const attributeClass = await unstable_cache(
    async () => {
      validateInputs([attributeClassId, ZId]);

      try {
        return await prisma.attributeClass.findFirst({
          where: {
            id: attributeClassId,
          },
        });
      } catch (error) {
        throw new DatabaseError(`Database error when fetching attributeClass with id ${attributeClassId}`);
      }
    },
    [`getAttributeClass-${attributeClassId}`],
    {
      tags: [attributeClassCache.tag.byId(attributeClassId)],
      revalidate: SERVICES_REVALIDATION_INTERVAL,
    }
  )();

  if (!attributeClass) {
    return null;
  }

  return formatAttributeClassDateFields(attributeClass);
};

export const getAttributeClasses = async (
  environmentId: string,
  page?: number
): Promise<TAttributeClass[]> => {
  const attributeClasses = await unstable_cache(
    async () => {
      validateInputs([environmentId, ZId], [page, ZOptionalNumber]);

      try {
        const attributeClasses = await prisma.attributeClass.findMany({
          where: {
            environmentId: environmentId,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: page ? ITEMS_PER_PAGE : undefined,
          skip: page ? ITEMS_PER_PAGE * (page - 1) : undefined,
        });

        return attributeClasses;
      } catch (error) {
        throw new DatabaseError(
          `Database error when fetching attributeClasses for environment ${environmentId}`
        );
      }
    },
    [`getAttributeClasses-${environmentId}-${page}`],
    {
      tags: [attributeClassCache.tag.byEnvironmentId(environmentId)],
      revalidate: SERVICES_REVALIDATION_INTERVAL,
    }
  )();

  return attributeClasses.map(formatAttributeClassDateFields);
};

export const updateAttributeClass = async (
  attributeClassId: string,
  data: Partial<TAttributeClassUpdateInput>
): Promise<TAttributeClass | null> => {
  validateInputs([attributeClassId, ZId], [data, ZAttributeClassUpdateInput.partial()]);

  try {
    const attributeClass = await prisma.attributeClass.update({
      where: {
        id: attributeClassId,
      },
      data: {
        description: data.description,
        archived: data.archived,
      },
    });

    attributeClassCache.revalidate({
      id: attributeClass.id,
      environmentId: attributeClass.environmentId,
      name: attributeClass.name,
    });

    return attributeClass;
  } catch (error) {
    throw new DatabaseError(`Database error when updating attribute class with id ${attributeClassId}`);
  }
};

export const getAttributeClassByName = async (environmentId: string, name: string) =>
  await unstable_cache(
    async (): Promise<TAttributeClass | null> => {
      validateInputs([environmentId, ZId], [name, ZString]);

      return await prisma.attributeClass.findFirst({
        where: {
          environmentId,
          name,
        },
      });
    },
    [`getAttributeClassByName-${environmentId}-${name}`],
    {
      tags: [attributeClassCache.tag.byEnvironmentIdAndName(environmentId, name)],
      revalidate: SERVICES_REVALIDATION_INTERVAL,
    }
  )();

export const createAttributeClass = async (
  environmentId: string,
  name: string,
  type: TAttributeClassType
): Promise<TAttributeClass | null> => {
  validateInputs([environmentId, ZId], [name, ZString], [type, ZAttributeClassType]);

  const attributeClass = await prisma.attributeClass.create({
    data: {
      name,
      type,
      environment: {
        connect: {
          id: environmentId,
        },
      },
    },
  });

  attributeClassCache.revalidate({
    id: attributeClass.id,
    environmentId: attributeClass.environmentId,
    name: attributeClass.name,
  });

  return attributeClass;
};

export const deleteAttributeClass = async (attributeClassId: string): Promise<TAttributeClass> => {
  validateInputs([attributeClassId, ZId]);

  try {
    const deletedAttributeClass = await prisma.attributeClass.delete({
      where: {
        id: attributeClassId,
      },
    });

    attributeClassCache.revalidate({
      id: deletedAttributeClass.id,
      environmentId: deletedAttributeClass.environmentId,
      name: deletedAttributeClass.name,
    });

    return deletedAttributeClass;
  } catch (error) {
    throw new DatabaseError(`Database error when deleting webhook with ID ${attributeClassId}`);
  }
};
