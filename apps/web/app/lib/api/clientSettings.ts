import { prisma } from "@fastform/database";
import { TSettings } from "@fastform/types/js";

export const getSettings = async (environmentId: string, personId: string): Promise<TSettings> => {
  // get recontactDays from product
  const product = await prisma.product.findFirst({
    where: {
      environments: {
        some: {
          id: environmentId,
        },
      },
    },
    select: {
      recontactDays: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const person = await prisma.person.findUnique({
    where: {
      id: personId,
    },
    select: {
      attributes: {
        select: {
          id: true,
          value: true,
          attributeClassId: true,
        },
      },
    },
  });

  if (!person) {
    throw new Error("Person not found");
  }

  // get all forms that meet the displayOption criteria
  const potentialforms = await prisma.form.findMany({
    where: {
      OR: [
        {
          environmentId,
          type: "web",
          status: "inProgress",
          displayOption: "respondMultiple",
        },
        {
          environmentId,
          type: "web",
          status: "inProgress",
          displayOption: "displayOnce",
          displays: { none: { personId } },
        },
        {
          environmentId,
          type: "web",
          status: "inProgress",
          displayOption: "displayMultiple",
          displays: { none: { personId, status: "responded" } },
        },
      ],
    },
    select: {
      id: true,
      questions: true,
      recontactDays: true,
      triggers: {
        select: {
          id: true,
          actionClass: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        // last display
      },
      attributeFilters: {
        select: {
          id: true,
          condition: true,
          value: true,
          attributeClass: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      displays: {
        where: {
          personId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          createdAt: true,
        },
      },
      thankYouCard: true,
      welcomeCard: true,
      autoClose: true,
      delay: true,
    },
  });

  // get last display for this person
  const lastDisplayPerson = await prisma.display.findFirst({
    where: {
      personId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });

  // filter forms that meet the attributeFilters criteria
  const potentialformsWithAttributes = potentialforms.filter((form) => {
    const attributeFilters = form.attributeFilters;
    if (attributeFilters.length === 0) {
      return true;
    }
    // check if meets all attribute filters criterias
    return attributeFilters.every((attributeFilter) => {
      const attribute = person.attributes.find(
        (attribute) => attribute.attributeClassId === attributeFilter.attributeClass.id
      );
      if (attributeFilter.condition === "equals") {
        return attribute?.value === attributeFilter.value;
      } else if (attributeFilter.condition === "notEquals") {
        return attribute?.value !== attributeFilter.value;
      } else {
        throw Error("Invalid attribute filter condition");
      }
    });
  });

  // filter forms that meet the recontactDays criteria
  const forms = potentialformsWithAttributes
    .filter((form) => {
      if (!lastDisplayPerson) {
        // no display yet - always display
        return true;
      } else if (form.recontactDays !== null) {
        // if recontactDays is set on form, use that
        const lastDisplayform = form.displays[0];
        if (!lastDisplayform) {
          // no display yet - always display
          return true;
        }
        const lastDisplayDate = new Date(lastDisplayform.createdAt);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - lastDisplayDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= form.recontactDays;
      } else if (product.recontactDays !== null) {
        // if recontactDays is not set in form, use product recontactDays
        const lastDisplayDate = new Date(lastDisplayPerson.createdAt);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - lastDisplayDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= product.recontactDays;
      } else {
        // if recontactDays is not set in form or product, always display
        return true;
      }
    })
    .map((form) => {
      return {
        id: form.id,
        questions: JSON.parse(JSON.stringify(form.questions)),
        triggers: form.triggers.map((trigger) => trigger.actionClass.name),
        thankYouCard: JSON.parse(JSON.stringify(form.thankYouCard)),
        welcomeCard: JSON.parse(JSON.stringify(form.welcomeCard)),
        autoClose: form.autoClose,
        delay: form.delay,
      };
    });

  const noCodeEvents = await prisma.actionClass.findMany({
    where: {
      environmentId,
      type: "noCode",
    },
    select: {
      name: true,
      noCodeConfig: true,
    },
  });

  const environmentProdut = await prisma.environment.findUnique({
    where: {
      id: environmentId,
    },
    select: {
      product: {
        select: {
          brandColor: true,
          linkFormBranding: true,
          placement: true,
          darkOverlay: true,
          clickOutsideClose: true,
        },
      },
    },
  });

  const fastformSignature = environmentProdut?.product.linkFormBranding;
  const brandColor = environmentProdut?.product.brandColor;
  const placement = environmentProdut?.product.placement;
  const darkOverlay = environmentProdut?.product.darkOverlay;
  const clickOutsideClose = environmentProdut?.product.clickOutsideClose;

  return {
    forms,
    noCodeEvents,
    brandColor,
    fastformSignature,
    placement,
    darkOverlay,
    clickOutsideClose,
  };
};
