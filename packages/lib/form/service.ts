import "server-only";

import { prisma } from "@fastform/database";
import { TActionClass } from "@fastform/types/actionClasses";
import { ZOptionalNumber } from "@fastform/types/common";
import { ZId } from "@fastform/types/environment";
import { DatabaseError, ResourceNotFoundError } from "@fastform/types/errors";
import { TPerson } from "@fastform/types/people";
import { TForm, TformAttributeFilter, TformInput, Zform } from "@fastform/types/forms";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getActionClasses } from "../actionClass/service";
import { getAttributeClasses } from "../attributeClass/service";
import { ITEMS_PER_PAGE, SERVICES_REVALIDATION_INTERVAL } from "../constants";
import { displayCache } from "../display/cache";
import { getDisplaysByPersonId } from "../display/service";
import { personCache } from "../person/cache";
import { productCache } from "../product/cache";
import { getProductByEnvironmentId } from "../product/service";
import { responseCache } from "../response/cache";
import { captureTelemetry } from "../telemetry";
import { diffInDays } from "../utils/datetime";
import { validateInputs } from "../utils/validate";
import { formCache } from "./cache";
import { formatformDateFields } from "./util";

export const selectform = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  type: true,
  environmentId: true,
  status: true,
  welcomeCard: true,
  questions: true,
  thankYouCard: true,
  hiddenFields: true,
  displayOption: true,
  recontactDays: true,
  autoClose: true,
  closeOnDate: true,
  delay: true,
  autoComplete: true,
  verifyEmail: true,
  redirectUrl: true,
  productOverwrites: true,
  styling: true,
  formClosedMessage: true,
  singleUse: true,
  pin: true,
  triggers: {
    select: {
      actionClass: {
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          environmentId: true,
          name: true,
          description: true,
          type: true,
          noCodeConfig: true,
        },
      },
    },
  },
  attributeFilters: {
    select: {
      id: true,
      attributeClassId: true,
      condition: true,
      value: true,
    },
  },
};

const getActionClassIdFromName = (actionClasses: TActionClass[], actionClassName: string): string => {
  return actionClasses.find((actionClass) => actionClass.name === actionClassName)!.id;
};

const revalidateformByActionClassId = (actionClasses: TActionClass[], actionClassNames: string[]): void => {
  for (const actionClassName of actionClassNames) {
    const actionClassId: string = getActionClassIdFromName(actionClasses, actionClassName);
    formCache.revalidate({
      actionClassId,
    });
  }
};

const revalidateformByAttributeClassId = (attributeFilters: TformAttributeFilter[]): void => {
  for (const attributeFilter of attributeFilters) {
    formCache.revalidate({
      attributeClassId: attributeFilter.attributeClassId,
    });
  }
};

export const getform = async (formId: string): Promise<TForm | null> => {
  const form = await unstable_cache(
    async () => {
      validateInputs([formId, ZId]);

      let formPrisma;
      try {
        formPrisma = await prisma.form.findUnique({
          where: {
            id: formId,
          },
          select: selectform,
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error(error);
          throw new DatabaseError(error.message);
        }

        throw error;
      }

      if (!formPrisma) {
        return null;
      }

      const transformedform = {
        ...formPrisma,
        triggers: formPrisma.triggers.map((trigger) => trigger.actionClass.name),
      };

      return transformedform;
    },
    [`getform-${formId}`],
    {
      tags: [formCache.tag.byId(formId)],
      revalidate: SERVICES_REVALIDATION_INTERVAL,
    }
  )();

  if (!form) {
    return null;
  }

  // since the unstable_cache function does not support deserialization of dates, we need to manually deserialize them
  // https://github.com/vercel/next.js/issues/51613
  return {
    ...form,
    ...formatformDateFields(form),
  };
};

export const getformsByAttributeClassId = async (
  attributeClassId: string,
  page?: number
): Promise<TForm[]> => {
  const forms = await unstable_cache(
    async () => {
      validateInputs([attributeClassId, ZId], [page, ZOptionalNumber]);

      const formsPrisma = await prisma.form.findMany({
        where: {
          attributeFilters: {
            some: {
              attributeClassId,
            },
          },
        },
        select: selectform,
        take: page ? ITEMS_PER_PAGE : undefined,
        skip: page ? ITEMS_PER_PAGE * (page - 1) : undefined,
      });

      const forms: TForm[] = [];

      for (const formPrisma of formsPrisma) {
        const transformedform = {
          ...formPrisma,
          triggers: formPrisma.triggers.map((trigger) => trigger.actionClass.name),
        };
        forms.push(transformedform);
      }

      return forms;
    },
    [`getformsByAttributeClassId-${attributeClassId}-${page}`],
    {
      tags: [formCache.tag.byAttributeClassId(attributeClassId)],
      revalidate: SERVICES_REVALIDATION_INTERVAL,
    }
  )();

  return forms.map((form) => ({
    ...form,
    ...formatformDateFields(form),
  }));
};

export const getformsByActionClassId = async (actionClassId: string, page?: number): Promise<TForm[]> => {
  const forms = await unstable_cache(
    async () => {
      validateInputs([actionClassId, ZId], [page, ZOptionalNumber]);

      const formsPrisma = await prisma.form.findMany({
        where: {
          triggers: {
            some: {
              actionClass: {
                id: actionClassId,
              },
            },
          },
        },
        select: selectform,
        take: page ? ITEMS_PER_PAGE : undefined,
        skip: page ? ITEMS_PER_PAGE * (page - 1) : undefined,
      });

      const forms: TForm[] = [];

      for (const formPrisma of formsPrisma) {
        const transformedform = {
          ...formPrisma,
          triggers: formPrisma.triggers.map((trigger) => trigger.actionClass.name),
        };
        forms.push(transformedform);
      }

      return forms;
    },
    [`getformsByActionClassId-${actionClassId}-${page}`],
    {
      tags: [formCache.tag.byActionClassId(actionClassId)],
      revalidate: SERVICES_REVALIDATION_INTERVAL,
    }
  )();

  return forms.map((form) => ({
    ...form,
    ...formatformDateFields(form),
  }));
};

export const getforms = async (environmentId: string, page?: number): Promise<TForm[]> => {
  const forms = await unstable_cache(
    async () => {
      validateInputs([environmentId, ZId], [page, ZOptionalNumber]);
      let formsPrisma;
      try {
        formsPrisma = await prisma.form.findMany({
          where: {
            environmentId,
          },
          select: selectform,
          take: page ? ITEMS_PER_PAGE : undefined,
          skip: page ? ITEMS_PER_PAGE * (page - 1) : undefined,
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.error(error);
          throw new DatabaseError(error.message);
        }

        throw error;
      }

      const forms: TForm[] = [];

      for (const formPrisma of formsPrisma) {
        const transformedform = {
          ...formPrisma,
          triggers: formPrisma.triggers.map((trigger) => trigger.actionClass.name),
        };
        forms.push(transformedform);
      }
      return forms;
    },
    [`getforms-${environmentId}-${page}`],
    {
      tags: [formCache.tag.byEnvironmentId(environmentId)],
      revalidate: SERVICES_REVALIDATION_INTERVAL,
    }
  )();

  // since the unstable_cache function does not support deserialization of dates, we need to manually deserialize them
  // https://github.com/vercel/next.js/issues/51613
  return forms.map((form) => ({
    ...form,
    ...formatformDateFields(form),
  }));
};

export const updateform = async (updatedform: TForm): Promise<TForm> => {
  validateInputs([updatedform, Zform]);

  const formId = updatedform.id;
  let data: any = {};

  const actionClasses = await getActionClasses(updatedform.environmentId);
  const currentform = await getform(formId);

  if (!currentform) {
    throw new ResourceNotFoundError("Form", formId);
  }

  const { triggers, attributeFilters, environmentId, ...formData } = updatedform;

  if (triggers) {
    const newTriggers: string[] = [];
    const removedTriggers: string[] = [];

    // find added triggers
    for (const trigger of triggers) {
      if (!trigger) {
        continue;
      }
      if (currentform.triggers.find((t) => t === trigger)) {
        continue;
      } else {
        newTriggers.push(trigger);
      }
    }

    // find removed triggers
    for (const trigger of currentform.triggers) {
      if (triggers.find((t: any) => t === trigger)) {
        continue;
      } else {
        removedTriggers.push(trigger);
      }
    }
    // create new triggers
    if (newTriggers.length > 0) {
      data.triggers = {
        ...(data.triggers || []),
        create: newTriggers.map((trigger) => ({
          actionClassId: getActionClassIdFromName(actionClasses, trigger),
        })),
      };
    }
    // delete removed triggers
    if (removedTriggers.length > 0) {
      data.triggers = {
        ...(data.triggers || []),
        deleteMany: {
          actionClassId: {
            in: removedTriggers.map((trigger) => getActionClassIdFromName(actionClasses, trigger)),
          },
        },
      };
    }

    // Revalidation for newly added/removed actionClassId
    revalidateformByActionClassId(actionClasses, [...newTriggers, ...removedTriggers]);
  }

  if (attributeFilters) {
    const newFilters: TformAttributeFilter[] = [];
    const removedFilters: TformAttributeFilter[] = [];

    // find added attribute filters
    for (const attributeFilter of attributeFilters) {
      if (!attributeFilter.attributeClassId || !attributeFilter.condition || !attributeFilter.value) {
        continue;
      }

      if (
        currentform.attributeFilters.find(
          (f) =>
            f.attributeClassId === attributeFilter.attributeClassId &&
            f.condition === attributeFilter.condition &&
            f.value === attributeFilter.value
        )
      ) {
        continue;
      } else {
        newFilters.push({
          attributeClassId: attributeFilter.attributeClassId,
          condition: attributeFilter.condition,
          value: attributeFilter.value,
        });
      }
    }
    // find removed attribute filters
    for (const attributeFilter of currentform.attributeFilters) {
      if (
        attributeFilters.find(
          (f) =>
            f.attributeClassId === attributeFilter.attributeClassId &&
            f.condition === attributeFilter.condition &&
            f.value === attributeFilter.value
        )
      ) {
        continue;
      } else {
        removedFilters.push({
          attributeClassId: attributeFilter.attributeClassId,
          condition: attributeFilter.condition,
          value: attributeFilter.value,
        });
      }
    }

    // create new attribute filters
    if (newFilters.length > 0) {
      data.attributeFilters = {
        ...(data.attributeFilters || []),
        create: newFilters.map((attributeFilter) => ({
          attributeClassId: attributeFilter.attributeClassId,
          condition: attributeFilter.condition,
          value: attributeFilter.value,
        })),
      };
    }
    // delete removed attribute filter
    if (removedFilters.length > 0) {
      // delete all attribute filters that match the removed attribute classes
      await Promise.all(
        removedFilters.map(async (attributeFilter) => {
          await prisma.formAttributeFilter.deleteMany({
            where: {
              attributeClassId: attributeFilter.attributeClassId,
            },
          });
        })
      );
    }

    revalidateformByAttributeClassId([...newFilters, ...removedFilters]);
  }

  data = {
    ...formData,
    ...data,
  };

  try {
    const prismaform = await prisma.form.update({
      where: { id: formId },
      data,
    });

    const modifiedform: TForm = {
      ...prismaform, // Properties from prismaform
      triggers: updatedform.triggers ? updatedform.triggers : [], // Include triggers from updatedform
      attributeFilters: updatedform.attributeFilters ? updatedform.attributeFilters : [], // Include attributeFilters from updatedform
    };

    formCache.revalidate({
      id: modifiedform.id,
      environmentId: modifiedform.environmentId,
    });

    return modifiedform;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(error);
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};

export async function deleteform(formId: string) {
  validateInputs([formId, ZId]);

  const deletedform = await prisma.form.delete({
    where: {
      id: formId,
    },
    select: selectform,
  });

  responseCache.revalidate({
    formId,
    environmentId: deletedform.environmentId,
  });
  formCache.revalidate({
    id: deletedform.id,
    environmentId: deletedform.environmentId,
  });

  // Revalidate triggers by actionClassId
  deletedform.triggers.forEach((trigger) => {
    formCache.revalidate({
      actionClassId: trigger.actionClass.id,
    });
  });
  // Revalidate forms by attributeClassId
  deletedform.attributeFilters.forEach((attributeFilter) => {
    formCache.revalidate({
      attributeClassId: attributeFilter.attributeClassId,
    });
  });

  return deletedform;
}

export const createform = async (environmentId: string, formBody: TformInput): Promise<TForm> => {
  validateInputs([environmentId, ZId]);

  if (formBody.attributeFilters) {
    revalidateformByAttributeClassId(formBody.attributeFilters);
  }

  if (formBody.triggers) {
    const actionClasses = await getActionClasses(environmentId);
    revalidateformByActionClassId(actionClasses, formBody.triggers);
  }

  // TODO: Create with triggers & attributeFilters
  delete formBody.triggers;
  delete formBody.attributeFilters;
  const data: Omit<TformInput, "triggers" | "attributeFilters"> = {
    ...formBody,
  };

  const form = await prisma.form.create({
    data: {
      ...data,
      environment: {
        connect: {
          id: environmentId,
        },
      },
    },
    select: selectform,
  });

  const transformedform = {
    ...form,
    triggers: form.triggers.map((trigger) => trigger.actionClass.name),
  };

  captureTelemetry("form created");

  formCache.revalidate({
    id: form.id,
    environmentId: form.environmentId,
  });

  return transformedform;
};

export const duplicateform = async (environmentId: string, formId: string) => {
  validateInputs([environmentId, ZId], [formId, ZId]);
  const existingform = await getform(formId);

  if (!existingform) {
    throw new ResourceNotFoundError("Form", formId);
  }

  const actionClasses = await getActionClasses(environmentId);
  const newAttributeFilters = existingform.attributeFilters.map((attributeFilter) => ({
    attributeClassId: attributeFilter.attributeClassId,
    condition: attributeFilter.condition,
    value: attributeFilter.value,
  }));

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
        create: existingform.triggers.map((trigger) => ({
          actionClassId: getActionClassIdFromName(actionClasses, trigger),
        })),
      },
      attributeFilters: {
        create: newAttributeFilters,
      },
      environment: {
        connect: {
          id: environmentId,
        },
      },
      formClosedMessage: existingform.formClosedMessage
        ? JSON.parse(JSON.stringify(existingform.formClosedMessage))
        : Prisma.JsonNull,
      singleUse: existingform.singleUse
        ? JSON.parse(JSON.stringify(existingform.singleUse))
        : Prisma.JsonNull,
      productOverwrites: existingform.productOverwrites
        ? JSON.parse(JSON.stringify(existingform.productOverwrites))
        : Prisma.JsonNull,
      styling: existingform.styling ? JSON.parse(JSON.stringify(existingform.styling)) : Prisma.JsonNull,
      verifyEmail: existingform.verifyEmail
        ? JSON.parse(JSON.stringify(existingform.verifyEmail))
        : Prisma.JsonNull,
    },
  });

  formCache.revalidate({
    id: newform.id,
    environmentId: newform.environmentId,
  });

  // Revalidate forms by actionClassId
  revalidateformByActionClassId(actionClasses, existingform.triggers);

  // Revalidate forms by attributeClassId
  revalidateformByAttributeClassId(newAttributeFilters);

  return newform;
};

export const getSyncforms = (environmentId: string, person: TPerson): Promise<TForm[]> => {
  validateInputs([environmentId, ZId]);

  return unstable_cache(
    async () => {
      const product = await getProductByEnvironmentId(environmentId);

      if (!product) {
        throw new Error("Product not found");
      }

      let forms = await getforms(environmentId);

      // filtered forms for running and web
      forms = forms.filter((form) => form.status === "inProgress" && form.type === "web");

      const displays = await getDisplaysByPersonId(person.id);

      // filter forms that meet the displayOption criteria
      forms = forms.filter((form) => {
        if (form.displayOption === "respondMultiple") {
          return true;
        } else if (form.displayOption === "displayOnce") {
          return displays.filter((display) => display.formId === form.id).length === 0;
        } else if (form.displayOption === "displayMultiple") {
          return (
            displays.filter((display) => display.formId === form.id && display.responseId !== null)
              .length === 0
          );
        } else {
          throw Error("Invalid displayOption");
        }
      });

      const attributeClasses = await getAttributeClasses(environmentId);

      // filter forms that meet the attributeFilters criteria
      const potentialformsWithAttributes = forms.filter((form) => {
        const attributeFilters = form.attributeFilters;
        if (attributeFilters.length === 0) {
          return true;
        }
        // check if meets all attribute filters criterias
        return attributeFilters.every((attributeFilter) => {
          const attributeClassName = attributeClasses.find(
            (attributeClass) => attributeClass.id === attributeFilter.attributeClassId
          )?.name;
          if (!attributeClassName) {
            throw Error("Invalid attribute filter class");
          }
          const personAttributeValue = person.attributes[attributeClassName];
          if (attributeFilter.condition === "equals") {
            return personAttributeValue === attributeFilter.value;
          } else if (attributeFilter.condition === "notEquals") {
            return personAttributeValue !== attributeFilter.value;
          } else {
            throw Error("Invalid attribute filter condition");
          }
        });
      });

      const latestDisplay = displays[0];

      // filter forms that meet the recontactDays criteria
      forms = potentialformsWithAttributes.filter((form) => {
        if (!latestDisplay) {
          return true;
        } else if (form.recontactDays !== null) {
          const lastDisplayform = displays.filter((display) => display.formId === form.id)[0];
          if (!lastDisplayform) {
            return true;
          }
          return diffInDays(new Date(), new Date(lastDisplayform.createdAt)) >= form.recontactDays;
        } else if (product.recontactDays !== null) {
          return diffInDays(new Date(), new Date(latestDisplay.createdAt)) >= product.recontactDays;
        } else {
          return true;
        }
      });

      return forms;
    },
    [`getSyncforms-${environmentId}-${person.userId}`],
    {
      tags: [
        personCache.tag.byEnvironmentIdAndUserId(environmentId, person.userId),
        displayCache.tag.byPersonId(person.id),
        formCache.tag.byEnvironmentId(environmentId),
        productCache.tag.byEnvironmentId(environmentId),
      ],
      revalidate: SERVICES_REVALIDATION_INTERVAL,
    }
  )();
};
