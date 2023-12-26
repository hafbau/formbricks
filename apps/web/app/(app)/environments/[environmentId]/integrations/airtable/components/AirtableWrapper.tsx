"use client";
import Connect from "./Connect";
import Home from "./Home";
import { useState } from "react";
import { TForm } from "@fastform/types/forms";
import { TEnvironment } from "@fastform/types/environment";
import { TIntegrationAirtable } from "@fastform/types/integration/airtable";
import { TIntegrationItem } from "@fastform/types/integration";

interface AirtableWrapperProps {
  environmentId: string;
  airtableArray: TIntegrationItem[];
  airtableIntegration?: TIntegrationAirtable;
  forms: TForm[];
  environment: TEnvironment;
  enabled: boolean;
  webAppUrl: string;
}

export default function AirtableWrapper({
  environmentId,
  airtableArray,
  airtableIntegration,
  forms,
  environment,
  enabled,
  webAppUrl,
}: AirtableWrapperProps) {
  const [isConnected, setIsConnected_] = useState(
    airtableIntegration ? airtableIntegration.config?.key : false
  );

  const setIsConnected = (data: boolean) => {
    setIsConnected_(data);
  };

  return isConnected && airtableIntegration ? (
    <Home
      airtableArray={airtableArray}
      environmentId={environmentId}
      environment={environment}
      airtableIntegration={airtableIntegration}
      setIsConnected={setIsConnected}
      forms={forms}
    />
  ) : (
    <Connect enabled={enabled} environmentId={environment.id} webAppUrl={webAppUrl} />
  );
}
