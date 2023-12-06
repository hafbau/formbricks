"use client";

import { TProduct, TProductUpdateInput } from "@fastform/types/product";
import { Alert, AlertDescription } from "@fastform/ui/Alert";
import { Label } from "@fastform/ui/Label";
import { Switch } from "@fastform/ui/Switch";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { updateProductAction } from "../actions";

interface EditFormbricksBrandingProps {
  type: "linkSurvey" | "inAppSurvey";
  product: TProduct;
  canRemoveBranding: boolean;
  environmentId: string;
  isFormbricksCloud?: boolean;
}

export function EditFormbricksBranding({
  type,
  product,
  canRemoveBranding,
  environmentId,
  isFormbricksCloud,
}: EditFormbricksBrandingProps) {
  const [isBrandingEnabled, setIsBrandingEnabled] = useState(
    type === "linkSurvey" ? product.linkSurveyBranding : product.inAppSurveyBranding
  );
  const [updatingBranding, setUpdatingBranding] = useState(false);

  const getTextFromType = (type) => {
    if (type === "linkSurvey") return "Link Surveys";
    if (type === "inAppSurvey") return "In App Surveys";
  };

  const toggleBranding = async () => {
    try {
      setUpdatingBranding(true);
      const newBrandingState = !isBrandingEnabled;
      setIsBrandingEnabled(newBrandingState);
      let inputProduct: Partial<TProductUpdateInput> = {
        [type === "linkSurvey" ? "linkSurveyBranding" : "inAppSurveyBranding"]: newBrandingState,
      };
      await updateProductAction(product.id, inputProduct);
      toast.success(
        newBrandingState ? "Fastform branding will be shown." : "Fastform branding will now be hidden."
      );
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setUpdatingBranding(false);
    }
  };

  return (
    <div className="w-full items-center">
      {!canRemoveBranding && (
        <div className="mb-4">
          <Alert>
            <AlertDescription>
              To remove the Fastform branding from the&nbsp;
              <span className="font-semibold">{getTextFromType(type)}</span>, please&nbsp;
              {type === "linkSurvey" ? (
                <span className="underline">
                  <Link href={`/environments/${environmentId}/settings/billing`}>upgrade your plan.</Link>
                </span>
              ) : (
                <span className="underline">
                  {isFormbricksCloud ? (
                    <Link href={`/environments/${environmentId}/settings/billing`}>add your creditcard.</Link>
                  ) : (
                    <a href="mailto:hola@fastform.com">get a self-hosted license (free to get started).</a>
                  )}
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <div className="mb-6 flex items-center space-x-2">
        <Switch
          id={`branding-${type}`}
          checked={isBrandingEnabled}
          onCheckedChange={toggleBranding}
          disabled={!canRemoveBranding || updatingBranding}
        />
        <Label htmlFor={`branding-${type}`}>
          Show Fastform Branding in {type === "linkSurvey" ? "Link" : "In-App"} Surveys
        </Label>
      </div>
    </div>
  );
}
