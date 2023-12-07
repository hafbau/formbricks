import { responses } from "@/app/lib/api/response";
import { getform } from "@fastform/lib/form/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import { NextRequest, NextResponse } from "next/server";
import uploadPrivateFile from "./lib/uploadPrivateFile";

interface Context {
  params: {
    environmentId: string;
  };
}

export async function OPTIONS(): Promise<NextResponse> {
  return responses.successResponse({}, true);
}

// api endpoint for uploading private files
// uploaded files will be private, only the user who has access to the environment can access the file
// uploading private files requires no authentication
// use this to let users upload files to a form for example
// this api endpoint will return a signed url for uploading the file to s3 and another url for uploading file to the local storage

export async function POST(req: NextRequest, context: Context): Promise<NextResponse> {
  const environmentId = context.params.environmentId;

  const { fileName, fileType, formId } = await req.json();

  if (!formId) {
    return responses.badRequestResponse("formId ID is required");
  }

  if (!fileName) {
    return responses.badRequestResponse("fileName is required");
  }

  if (!fileType) {
    return responses.badRequestResponse("contentType is required");
  }

  const [form, team] = await Promise.all([getform(formId), getTeamByEnvironmentId(environmentId)]);

  if (!form) {
    return responses.notFoundResponse("Form", formId);
  }

  if (!team) {
    return responses.notFoundResponse("TeamByEnvironmentId", environmentId);
  }

  const plan = team.billing.features.linkform.status in ["active", "canceled"] ? "pro" : "free";

  return await uploadPrivateFile(fileName, environmentId, fileType, plan);
}
