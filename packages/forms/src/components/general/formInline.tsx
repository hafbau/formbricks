import { SurveyBaseProps } from "@/types/props";
import { Form } from "./Form";

export function SurveyInline({
  form,
  isBrandingEnabled,
  activeQuestionId,
  onDisplay = () => {},
  onActiveQuestionChange = () => {},
  onResponse = () => {},
  onClose = () => {},
  prefillResponseData,
  isRedirectDisabled = false,
  onFileUpload,
  responseCount,
}: SurveyBaseProps) {
  return (
    <div id="fbjs" className="fastform-form h-full w-full">
      <Form
        form={form}
        isBrandingEnabled={isBrandingEnabled}
        activeQuestionId={activeQuestionId}
        onDisplay={onDisplay}
        onActiveQuestionChange={onActiveQuestionChange}
        onResponse={onResponse}
        onClose={onClose}
        prefillResponseData={prefillResponseData}
        isRedirectDisabled={isRedirectDisabled}
        onFileUpload={onFileUpload}
        responseCount={responseCount}
      />
    </div>
  );
}
