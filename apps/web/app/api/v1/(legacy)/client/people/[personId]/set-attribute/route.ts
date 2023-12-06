import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { getActionClasses } from "@fastform/lib/actionClass/service";
import { createAttributeClass, getAttributeClassByName } from "@fastform/lib/attributeClass/service";
import { personCache } from "@fastform/lib/person/cache";
import { getPerson, updatePersonAttribute } from "@fastform/lib/person/service";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { surveyCache } from "@fastform/lib/form/cache";
import { getSyncSurveys } from "@fastform/lib/form/service";
import { TJsStateSync, ZJsPeopleAttributeInput } from "@fastform/types/js";
import { NextResponse } from "next/server";

interface Context {
  params: {
    personId: string;
    environmentId: string;
  };
}

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

export async function POST(req: Request, context: Context): Promise<NextResponse> {
  try {
    const { personId, environmentId } = context.params;
    const jsonInput = await req.json();

    // validate using zod
    const inputValidation = ZJsPeopleAttributeInput.safeParse(jsonInput);

    if (!inputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(inputValidation.error),
        true
      );
    }

    const { key, value } = inputValidation.data;

    const person = await getPerson(personId);

    if (!person) {
      return responses.notFoundResponse("Person", personId, true);
    }

    let attributeClass = await getAttributeClassByName(environmentId, key);

    // create new attribute class if not found
    if (attributeClass === null) {
      attributeClass = await createAttributeClass(environmentId, key, "code");
    }

    if (!attributeClass) {
      return responses.internalServerErrorResponse("Unable to create attribute class", true);
    }

    // upsert attribute (update or create)
    await updatePersonAttribute(personId, attributeClass.id, value);

    personCache.revalidate({
      id: personId,
      environmentId,
    });

    surveyCache.revalidate({
      environmentId,
    });

    const [surveys, noCodeActionClasses, product] = await Promise.all([
      getSyncSurveys(environmentId, person),
      getActionClasses(environmentId),
      getProductByEnvironmentId(environmentId),
    ]);

    if (!product) {
      throw new Error("Product not found");
    }

    // return state
    const state: TJsStateSync = {
      person: { id: person.id, userId: person.userId },
      surveys,
      noCodeActionClasses: noCodeActionClasses.filter((actionClass) => actionClass.type === "noCode"),
      product,
    };

    return responses.successResponse({ ...state }, true);
  } catch (error) {
    console.error(error);
    return responses.internalServerErrorResponse(`Unable to complete request: ${error.message}`, true);
  }
}
