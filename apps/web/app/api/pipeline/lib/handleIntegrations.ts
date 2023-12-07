import { writeData as airtableWriteData } from "@fastform/lib/airtable/service";
import { TIntegration } from "@fastform/types/integration";
import { writeData } from "@fastform/lib/googleSheet/service";
import { getform } from "@fastform/lib/form/service";
import { TPipelineInput } from "@fastform/types/pipelines";
import { TIntegrationGoogleSheets } from "@fastform/types/integration/googleSheet";
import { TIntegrationAirtable } from "@fastform/types/integration/airtable";

export async function handleIntegrations(integrations: TIntegration[], data: TPipelineInput) {
  for (const integration of integrations) {
    switch (integration.type) {
      case "googleSheets":
        await handleGoogleSheetsIntegration(integration as TIntegrationGoogleSheets, data);
        break;
      case "airtable":
        await handleAirtableIntegration(integration as TIntegrationAirtable, data);
        break;
    }
  }
}

async function handleAirtableIntegration(integration: TIntegrationAirtable, data: TPipelineInput) {
  if (integration.config.data.length > 0) {
    for (const element of integration.config.data) {
      if (element.formId === data.formId) {
        const values = await extractResponses(data, element.questionIds);

        await airtableWriteData(integration.config.key, element, values);
      }
    }
  }
}

async function handleGoogleSheetsIntegration(integration: TIntegrationGoogleSheets, data: TPipelineInput) {
  if (integration.config.data.length > 0) {
    for (const element of integration.config.data) {
      if (element.formId === data.formId) {
        const values = await extractResponses(data, element.questionIds);
        await writeData(integration.config.key, element.spreadsheetId, values);
      }
    }
  }
}

async function extractResponses(data: TPipelineInput, questionIds: string[]): Promise<string[][]> {
  const responses: string[] = [];
  const questions: string[] = [];
  const form = await getform(data.formId);

  for (const questionId of questionIds) {
    const responseValue = data.response.data[questionId];

    if (responseValue !== undefined) {
      responses.push(Array.isArray(responseValue) ? responseValue.join(",") : String(responseValue));
    } else {
      responses.push("");
    }

    const question = form?.questions.find((q) => q.id === questionId);
    questions.push(question?.headline || "");
  }

  return [responses, questions];
}
