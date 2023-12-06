export const revalidate = REVALIDATION_INTERVAL;

import { validateSurveySingleUseId } from "@/app/lib/singleUseSurveys";
import LegalFooter from "@/app/s/[surveyId]/components/LegalFooter";
import LinkSurvey from "@/app/s/[surveyId]/components/LinkSurvey";
import { MediaBackground } from "@/app/s/[surveyId]/components/MediaBackground";
import PinScreen from "@/app/s/[surveyId]/components/PinScreen";
import SurveyInactive from "@/app/s/[surveyId]/components/SurveyInactive";
import { checkValidity } from "@/app/s/[surveyId]/lib/prefilling";
import { REVALIDATION_INTERVAL, WEBAPP_URL } from "@fastform/lib/constants";
import { createPerson, getPersonByUserId } from "@fastform/lib/person/service";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { getResponseBySingleUseId } from "@fastform/lib/response/service";
import { getSurvey } from "@fastform/lib/form/service";
import { TResponse } from "@fastform/types/responses";
import type { Metadata } from "next";

import { notFound } from "next/navigation";
import { getEmailVerificationStatus } from "./lib/helpers";
import { ZId } from "@fastform/types/environment";
import { getResponseCountBySurveyId } from "@fastform/lib/response/service";

interface LinkSurveyPageProps {
  params: {
    surveyId: string;
  };
  searchParams: {
    suId?: string;
    userId?: string;
    verify?: string;
  };
}

export async function generateMetadata({ params }: LinkSurveyPageProps): Promise<Metadata> {
  const validId = ZId.safeParse(params.surveyId);
  if (!validId.success) {
    notFound();
  }

  const form = await getSurvey(params.surveyId);

  if (!form || form.type !== "link" || form.status === "draft") {
    notFound();
  }

  const product = await getProductByEnvironmentId(form.environmentId);

  if (!product) {
    throw new Error("Product not found");
  }

  function getNameForURL(string) {
    return string.replace(/ /g, "%20");
  }

  function getBrandColorForURL(string) {
    return string.replace(/#/g, "%23");
  }

  const brandColor = getBrandColorForURL(product.brandColor);
  const surveyName = getNameForURL(form.name);

  const ogImgURL = `/api/v1/og?brandColor=${brandColor}&name=${surveyName}`;

  return {
    title: form.name,
    metadataBase: new URL(WEBAPP_URL),
    openGraph: {
      title: form.name,
      description: "Create your own form like this with Fastform' open source form suite.",
      url: `/s/${form.id}`,
      siteName: "",
      images: [ogImgURL],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: form.name,
      description: "Create your own form like this with Fastform' open source form suite.",
      images: [ogImgURL],
    },
  };
}

export default async function LinkSurveyPage({ params, searchParams }: LinkSurveyPageProps) {
  const validId = ZId.safeParse(params.surveyId);
  if (!validId.success) {
    notFound();
  }
  const form = await getSurvey(params.surveyId);

  const suId = searchParams.suId;
  const isSingleUseSurvey = form?.singleUse?.enabled;
  const isSingleUseSurveyEncrypted = form?.singleUse?.isEncrypted;

  if (!form || form.type !== "link" || form.status === "draft") {
    notFound();
  }

  // question pre filling: Check if the first question is prefilled and if it is valid
  const prefillAnswer = searchParams[form.questions[0].id];
  const isPrefilledAnswerValid = prefillAnswer ? checkValidity(form!.questions[0], prefillAnswer) : false;

  if (form && form.status !== "inProgress") {
    return (
      <SurveyInactive
        status={form.status}
        surveyClosedMessage={form.surveyClosedMessage ? form.surveyClosedMessage : undefined}
      />
    );
  }

  let singleUseId: string | undefined = undefined;
  if (isSingleUseSurvey) {
    // check if the single use id is present for single use surveys
    if (!suId) {
      return <SurveyInactive status="link invalid" />;
    }

    // if encryption is enabled, validate the single use id
    let validatedSingleUseId: string | undefined = undefined;
    if (isSingleUseSurveyEncrypted) {
      validatedSingleUseId = validateSurveySingleUseId(suId);
      if (!validatedSingleUseId) {
        return <SurveyInactive status="link invalid" />;
      }
    }
    // if encryption is disabled, use the suId as is
    singleUseId = validatedSingleUseId ?? suId;
  }

  let singleUseResponse: TResponse | undefined = undefined;
  if (isSingleUseSurvey) {
    try {
      singleUseResponse = singleUseId
        ? (await getResponseBySingleUseId(form.id, singleUseId)) ?? undefined
        : undefined;
    } catch (error) {
      singleUseResponse = undefined;
    }
  }

  // verify email: Check if the form requires email verification
  let emailVerificationStatus: string | undefined = undefined;
  if (form.verifyEmail) {
    const token =
      searchParams && Object.keys(searchParams).length !== 0 && searchParams.hasOwnProperty("verify")
        ? searchParams.verify
        : undefined;

    if (token) {
      emailVerificationStatus = await getEmailVerificationStatus(form.id, token);
    }
  }

  // get product and person
  const product = await getProductByEnvironmentId(form.environmentId);
  if (!product) {
    throw new Error("Product not found");
  }

  const userId = searchParams.userId;
  if (userId) {
    // make sure the person exists or get's created
    const person = await getPersonByUserId(form.environmentId, userId);
    if (!person) {
      await createPerson(form.environmentId, userId);
    }
  }

  const isSurveyPinProtected = Boolean(!!form && form.pin);
  const responseCount = await getResponseCountBySurveyId(form.id);
  if (isSurveyPinProtected) {
    return (
      <PinScreen
        surveyId={form.id}
        product={product}
        userId={userId}
        emailVerificationStatus={emailVerificationStatus}
        prefillAnswer={isPrefilledAnswerValid ? prefillAnswer : null}
        singleUseId={isSingleUseSurvey ? singleUseId : undefined}
        singleUseResponse={singleUseResponse ? singleUseResponse : undefined}
        webAppUrl={WEBAPP_URL}
      />
    );
  }

  return form ? (
    <div>
      <MediaBackground form={form}>
        <LinkSurvey
          form={form}
          product={product}
          userId={userId}
          emailVerificationStatus={emailVerificationStatus}
          prefillAnswer={isPrefilledAnswerValid ? prefillAnswer : null}
          singleUseId={isSingleUseSurvey ? singleUseId : undefined}
          singleUseResponse={singleUseResponse ? singleUseResponse : undefined}
          webAppUrl={WEBAPP_URL}
          responseCount={form.welcomeCard.showResponseCount ? responseCount : undefined}
        />
      </MediaBackground>
      <LegalFooter bgColor={form.styling?.background?.bg || "#ffff"} />
    </div>
  ) : null;
}
