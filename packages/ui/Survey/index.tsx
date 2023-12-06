import { renderSurveyInline, renderSurveyModal } from "@fastform/surveys";
import { TResponseData, TResponseUpdate } from "@fastform/types/responses";
import { TUploadFileConfig } from "@fastform/types/storage";
import { TSurvey } from "@fastform/types/surveys";
import { useEffect, useMemo } from "react";

const createContainerId = () => `fastform-form-container`;

interface SurveyProps {
  form: TSurvey;
  brandColor: string;
  isBrandingEnabled: boolean;
  activeQuestionId?: string;
  onDisplay?: () => void;
  onResponse?: (response: TResponseUpdate) => void;
  onFinished?: () => void;
  onActiveQuestionChange?: (questionId: string) => void;
  onClose?: () => void;
  onFileUpload: (file: File, config?: TUploadFileConfig) => Promise<string>;
  autoFocus?: boolean;
  prefillResponseData?: TResponseData;
  isRedirectDisabled?: boolean;
  responseCount?: number;
}

interface SurveyModalProps extends SurveyProps {
  placement?: "topRight" | "bottomRight" | "bottomLeft" | "topLeft" | "center";
  clickOutside?: boolean;
  darkOverlay?: boolean;
  highlightBorderColor?: string | null;
}

export const SurveyInline = ({
  form,
  brandColor,
  isBrandingEnabled,
  activeQuestionId,
  onDisplay = () => {},
  onResponse = () => {},
  onActiveQuestionChange = () => {},
  onClose = () => {},
  autoFocus,
  prefillResponseData,
  isRedirectDisabled,
  onFileUpload,
  responseCount,
}: SurveyProps) => {
  const containerId = useMemo(() => createContainerId(), []);
  useEffect(() => {
    renderSurveyInline({
      form,
      brandColor,
      isBrandingEnabled,
      containerId,
      onDisplay,
      onResponse,
      onClose,
      activeQuestionId,
      onActiveQuestionChange,
      autoFocus,
      prefillResponseData,
      isRedirectDisabled,
      onFileUpload,
      responseCount,
    });
  }, [
    activeQuestionId,
    brandColor,
    containerId,
    isBrandingEnabled,
    onActiveQuestionChange,
    onClose,
    onDisplay,
    onResponse,
    form,
    autoFocus,
    prefillResponseData,
    isRedirectDisabled,
    onFileUpload,
    responseCount,
  ]);
  return <div id={containerId} className="h-full w-full" />;
};

export const SurveyModal = ({
  form,
  brandColor,
  isBrandingEnabled,
  activeQuestionId,
  placement = "bottomRight",
  clickOutside = false,
  darkOverlay = false,
  highlightBorderColor = null,
  onDisplay = () => {},
  onResponse = () => {},
  onActiveQuestionChange = () => {},
  onClose = () => {},
  autoFocus,
  isRedirectDisabled,
  onFileUpload,
  responseCount,
}: SurveyModalProps) => {
  useEffect(() => {
    renderSurveyModal({
      form,
      brandColor,
      isBrandingEnabled,
      placement,
      clickOutside,
      darkOverlay,
      highlightBorderColor,
      onDisplay,
      onResponse,
      onClose,
      activeQuestionId,
      onActiveQuestionChange,
      autoFocus,
      isRedirectDisabled,
      onFileUpload,
      responseCount,
    });
  }, [
    activeQuestionId,
    brandColor,
    clickOutside,
    darkOverlay,
    isBrandingEnabled,
    highlightBorderColor,
    onActiveQuestionChange,
    onClose,
    onDisplay,
    onResponse,
    placement,
    form,
    autoFocus,
    isRedirectDisabled,
    onFileUpload,
    responseCount,
  ]);
  return <div id="fastform-form"></div>;
};
