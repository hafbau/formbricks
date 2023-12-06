"use client";
import Connect from "./Connect";
import Home from "./Home";
import { useState } from "react";
import { TSurvey } from "@fastform/types/surveys";
import { TEnvironment } from "@fastform/types/environment";
import { TIntegrationAirtable } from "@fastform/types/integration/airtable";
import { TIntegrationItem } from "@fastform/types/integration";

interface AirtableWrapperProps {
  environmentId: string;
  airtableArray: TIntegrationItem[];
  airtableIntegration?: TIntegrationAirtable;
  surveys: TSurvey[];
  environment: TEnvironment;
  enabled: boolean;
  webAppUrl: string;
}

export default function AirtableWrapper({
  environmentId,
  airtableArray,
  airtableIntegration,
  surveys,
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
      surveys={surveys}
    />
  ) : (
    <Connect enabled={enabled} environmentId={environment.id} webAppUrl={webAppUrl} />
  );
}
