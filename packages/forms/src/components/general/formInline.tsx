import { FormBaseProps } from "@/types/props";
import { Form } from "./Form";

export function FormInline({
  form,
  isBrandingEnabled,
  activeQuestionId,
  onDisplay = () => { },
  onActiveQuestionChange = () => { },
  onResponse = () => { },
  onClose = () => { },
  prefillResponseData,
  isRedirectDisabled = false,
  onFileUpload,
  responseCount,
}: FormBaseProps) {
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
