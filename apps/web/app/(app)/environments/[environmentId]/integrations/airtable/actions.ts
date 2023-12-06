"use server";

import { getAirtableTables } from "@fastform/lib/airtable/service";

export async function refreshTablesAction(environmentId: string) {
  return await getAirtableTables(environmentId);
}
