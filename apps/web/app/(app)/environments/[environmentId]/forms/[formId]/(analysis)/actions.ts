"use server";
import { revalidatePath } from "next/cache";

export default async function revalidateformIdPath(environmentId: string, formId: string) {
  revalidatePath(`/environments/${environmentId}/forms/${formId}`);
}
