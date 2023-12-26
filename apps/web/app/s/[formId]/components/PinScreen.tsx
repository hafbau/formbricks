"use client";

import { validateformPinAction } from "@/app/s/[formId]/actions";
import Linkform from "@/app/s/[formId]/components/Linkform";
import { TformPinValidationResponseError } from "@/app/s/[formId]/types";
import { cn } from "@fastform/lib/cn";
import { TProduct } from "@fastform/types/product";
import { TResponse } from "@fastform/types/responses";
import { TForm } from "@fastform/types/forms";
import { OTPInput } from "@fastform/ui/OTPInput";
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";

interface LinkformPinScreenProps {
  formId: string;
  product: TProduct;
  userId?: string;
  emailVerificationStatus?: string;
  prefillAnswer?: string;
  singleUseId?: string;
  singleUseResponse?: TResponse;
  webAppUrl: string;
}

const LinkformPinScreen: NextPage<LinkformPinScreenProps> = (props) => {
  const {
    formId,
    product,
    webAppUrl,
    emailVerificationStatus,
    userId,
    prefillAnswer,
    singleUseId,
    singleUseResponse,
  } = props;

  const [localPinEntry, setLocalPinEntry] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<TformPinValidationResponseError>();
  const [form, setform] = useState<TForm>();

  const _validateformPinAsync = useCallback(async (formId: string, pin: string) => {
    const response = await validateformPinAction(formId, pin);
    if (response.error) {
      setError(response.error);
    } else if (response.form) {
      setform(response.form);
    }
    setLoading(false);
  }, []);

  const resetState = useCallback(() => {
    setError(undefined);
    setLoading(false);
    setLocalPinEntry("");
  }, []);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => resetState(), 2 * 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [error, resetState]);

  useEffect(() => {
    const validPinRegex = /^\d{4}$/;
    const isValidPin = validPinRegex.test(localPinEntry);

    if (isValidPin) {
      // Show loading and check against the server
      setLoading(true);
      _validateformPinAsync(formId, localPinEntry);
      return;
    }

    setError(undefined);
    setLoading(false);
  }, [_validateformPinAsync, localPinEntry, formId]);

  if (!form) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="my-4 font-semibold">
            <h4>This form is protected. Enter the PIN below</h4>
          </div>
          <OTPInput
            disabled={Boolean(error) || loading}
            value={localPinEntry}
            onChange={(value) => setLocalPinEntry(value)}
            valueLength={4}
            inputBoxClassName={cn({ "border-red-400": Boolean(error) })}
          />
        </div>
      </div>
    );
  }

  return (
    <Linkform
      form={form}
      product={product}
      userId={userId}
      emailVerificationStatus={emailVerificationStatus}
      prefillAnswer={prefillAnswer}
      singleUseId={singleUseId}
      singleUseResponse={singleUseResponse}
      webAppUrl={webAppUrl}
    />
  );
};

export default LinkformPinScreen;
