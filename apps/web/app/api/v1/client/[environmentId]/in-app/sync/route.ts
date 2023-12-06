import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { getActionClasses } from "@fastform/lib/actionClass/service";
import { getEnvironment, updateEnvironment } from "@fastform/lib/environment/service";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { getSurveys } from "@fastform/lib/form/service";
import { TJsStateSync, ZJsPublicSyncInput } from "@fastform/types/js";
import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

export async function GET(
  _: NextRequest,
  { params }: { params: { environmentId: string } }
): Promise<NextResponse> {
  try {
    // validate using zod
    const environmentIdValidation = ZJsPublicSyncInput.safeParse({
      environmentId: params.environmentId,
    });

    if (!environmentIdValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(environmentIdValidation.error),
        true
      );
    }

    const { environmentId } = environmentIdValidation.data;

    const environment = await getEnvironment(environmentId);

    if (!environment) {
      throw new Error("Environment does not exist");
    }

    if (!environment?.widgetSetupCompleted) {
      await updateEnvironment(environment.id, { widgetSetupCompleted: true });
    }

    const [surveys, noCodeActionClasses, product] = await Promise.all([
      getSurveys(environmentId),
      getActionClasses(environmentId),
      getProductByEnvironmentId(environmentId),
    ]);
    if (!product) {
      throw new Error("Product not found");
    }

    const state: TJsStateSync = {
      surveys: surveys.filter((form) => form.status === "inProgress" && form.type === "web"),
      noCodeActionClasses: noCodeActionClasses.filter((actionClass) => actionClass.type === "noCode"),
      product,
      person: null,
    };

    return responses.successResponse({ ...state }, true);
  } catch (error) {
    console.error(error);
    return responses.internalServerErrorResponse(`Unable to complete response: ${error.message}`, true);
  }
}
