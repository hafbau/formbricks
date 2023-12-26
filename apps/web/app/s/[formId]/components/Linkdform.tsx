"use client";

import FormLinkUsed from "@/app/s/[formId]/components/FormLinkUsed";
import VerifyEmail from "@/app/s/[formId]/components/VerifyEmail";
import { getPrefillResponseData } from "@/app/s/[formId]/lib/prefilling";
import { FastformAPI } from "@fastform/api";
import { ResponseQueue } from "@fastform/lib/responseQueue";
import { FormState } from "@fastform/lib/formState";
import { TProduct } from "@fastform/types/product";
import { TResponse, TResponseData, TResponseUpdate } from "@fastform/types/responses";
import { TUploadFileConfig } from "@fastform/types/storage";
import { TForm } from "@fastform/types/forms";
import ContentWrapper from "@fastform/ui/ContentWrapper";
import { FormInline } from "@fastform/ui/Form";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface LinkFormProps {
  form: TForm;
  product: TProduct;
  userId?: string;
  emailVerificationStatus?: string;
  prefillAnswer?: string;
  singleUseId?: string;
  singleUseResponse?: TResponse;
  webAppUrl: string;
  responseCount?: number;
}

export default function LinkForm({
  form,
  product,
  userId,
  emailVerificationStatus,
  prefillAnswer,
  singleUseId,
  singleUseResponse,
  webAppUrl,
  responseCount,
}: LinkFormProps) {
  const responseId = singleUseResponse?.id;
  const searchParams = useSearchParams();
  const isPreview = searchParams?.get("preview") === "true";
  const sourceParam = searchParams?.get("source");
  // pass in the responseId if the form is a single use form, ensures form state is updated with the responseId
  const [formState, setformState] = useState(new FormState(form.id, singleUseId, responseId, userId));
  const [activeQuestionId, setActiveQuestionId] = useState<string>(
    form.welcomeCard.enabled ? "start" : form?.questions[0]?.id
  );
  const prefillResponseData: TResponseData | undefined = prefillAnswer
    ? getPrefillResponseData(form.questions[0], form, prefillAnswer)
    : undefined;

  const brandColor = form.productOverwrites?.brandColor || product.brandColor;

  const responseQueue = useMemo(
    () =>
      new ResponseQueue(
        {
          apiHost: webAppUrl,
          environmentId: form.environmentId,
          retryAttempts: 2,
          onResponseSendingFailed: (response) => {
            alert(`Failed to send response: ${JSON.stringify(response, null, 2)}`);
          },
          setformState: setformState,
        },
        formState
      ),
    [webAppUrl, form?.environmentId, formState]
  );
  const [autoFocus, setAutofocus] = useState(false);
  const hasFinishedSingleUseResponse = useMemo(() => {
    if (singleUseResponse && singleUseResponse.finished) {
      return true;
    }
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Not in an iframe, enable autofocus on input fields.
  useEffect(() => {
    if (window.self === window.top) {
      setAutofocus(true);
    }
  }, []);

  const hiddenFieldsRecord = useMemo<Record<string, string | number | string[]> | null>(() => {
    const fieldsRecord: Record<string, string | number | string[]> = {};
    let fieldsSet = false;

    form.hiddenFields?.fieldIds?.forEach((field) => {
      const answer = searchParams?.get(field);
      if (answer) {
        fieldsRecord[field] = answer;
        fieldsSet = true;
      }
    });

    // Only return the record if at least one field was set.
    return fieldsSet ? fieldsRecord : null;
  }, [searchParams, form.hiddenFields?.fieldIds]);

  useEffect(() => {
    responseQueue.updateformState(formState);
  }, [responseQueue, formState]);

  if (!formState.isResponseFinished() && hasFinishedSingleUseResponse) {
    return <FormLinkUsed singleUseMessage={form.singleUse} />;
  }
  if (form.verifyEmail && emailVerificationStatus !== "verified") {
    if (emailVerificationStatus === "fishy") {
      return <VerifyEmail form={form} isErrorComponent={true} />;
    }
    //emailVerificationStatus === "not-verified"
    return <VerifyEmail form={form} />;
  }

  return (
    <>
      <ContentWrapper className="h-full w-full p-0 md:max-w-md">
        {isPreview && (
          <div className="fixed left-0 top-0 flex w-full items-center justify-between bg-slate-600 p-2 px-4 text-center text-sm text-white shadow-sm">
            <div />
            Form Preview 👀
            <button
              className="flex items-center rounded-full bg-slate-500 px-3 py-1 hover:bg-slate-400"
              onClick={() =>
                setActiveQuestionId(form.welcomeCard.enabled ? "start" : form?.questions[0]?.id)
              }>
              Restart <ArrowPathIcon className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}
        <FormInline
          form={form}
          brandColor={brandColor}
          isBrandingEnabled={product.linkFormBranding}
          onDisplay={async () => {
            if (!isPreview) {
              const api = new FastformAPI({
                apiHost: webAppUrl,
                environmentId: form.environmentId,
              });
              const res = await api.client.display.create({
                formId: form.id,
              });
              if (!res.ok) {
                throw new Error("Could not create display");
              }
              const { id } = res.data;

              const newformState = formState.copy();
              newformState.updateDisplayId(id);
              setformState(newformState);
            }
          }}
          onResponse={(responseUpdate: TResponseUpdate) => {
            !isPreview &&
              responseQueue.add({
                data: {
                  ...responseUpdate.data,
                  ...hiddenFieldsRecord,
                },
                ttc: responseUpdate.ttc,
                finished: responseUpdate.finished,
                meta: {
                  url: window.location.href,
                  source: sourceParam || "",
                },
              });
          }}
          onFileUpload={async (file: File, params: TUploadFileConfig) => {
            const api = new FastformAPI({
              apiHost: webAppUrl,
              environmentId: form.environmentId,
            });

            try {
              const uploadedUrl = await api.client.storage.uploadFile(file, params);
              return uploadedUrl;
            } catch (err) {
              console.error(err);
              return "";
            }
          }}
          onActiveQuestionChange={(questionId) => setActiveQuestionId(questionId)}
          activeQuestionId={activeQuestionId}
          autoFocus={autoFocus}
          prefillResponseData={prefillResponseData}
          responseCount={responseCount}
        />
      </ContentWrapper>
    </>
  );
}
