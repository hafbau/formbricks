import { TResponseData, TResponseUpdate } from "@fastform/types/responses";
import { Tform } from "@fastform/types/forms";
import { TUploadFileConfig } from "@fastform/types/storage";

export interface formBaseProps {
  form: Tform;
  isBrandingEnabled: boolean;
  activeQuestionId?: string;
  onDisplay?: () => void;
  onResponse?: (response: TResponseUpdate) => void;
  onFinished?: () => void;
  onClose?: () => void;
  onActiveQuestionChange?: (questionId: string) => void;
  autoFocus?: boolean;
  isRedirectDisabled?: boolean;
  prefillResponseData?: TResponseData;
  onFileUpload: (file: File, config?: TUploadFileConfig) => Promise<string>;
  responseCount?: number;
}

export interface formInlineProps extends formBaseProps {
  containerId: string;
}

export interface formModalProps extends formBaseProps {
  clickOutside: boolean;
  darkOverlay: boolean;
  highlightBorderColor: string | null;
  placement: "bottomLeft" | "bottomRight" | "topLeft" | "topRight" | "center";
}
