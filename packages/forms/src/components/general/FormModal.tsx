import { useState } from "preact/hooks";
import { FormModalProps } from "@/types/props";
import Modal from "@/components/wrappers/Modal";
import { Form } from "./Form";

export function FormModal({
  form,
  isBrandingEnabled,
  activeQuestionId,
  placement,
  clickOutside,
  darkOverlay,
  highlightBorderColor,
  onDisplay = () => {},
  onActiveQuestionChange = () => {},
  onResponse = () => {},
  onClose = () => {},
  onFinished = () => {},
  onFileUpload,
  isRedirectDisabled = false,
  responseCount,
}: FormModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const close = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 1000); // wait for animation to finish}
  };

  return (
    <div id="fbjs" className="fastform-form">
      <Modal
        placement={placement}
        clickOutside={clickOutside}
        darkOverlay={darkOverlay}
        highlightBorderColor={highlightBorderColor}
        isOpen={isOpen}
        onClose={close}>
        <Form
          form={form}
          isBrandingEnabled={isBrandingEnabled}
          activeQuestionId={activeQuestionId}
          onDisplay={onDisplay}
          onActiveQuestionChange={onActiveQuestionChange}
          onResponse={onResponse}
          onClose={onClose}
          onFinished={() => {
            onFinished();
            setTimeout(() => {
              if (!form.redirectUrl) {
                close();
              }
            }, 4000); // close modal automatically after 4 seconds
          }}
          onFileUpload={onFileUpload}
          isRedirectDisabled={isRedirectDisabled}
          responseCount={responseCount}
        />
      </Modal>
    </div>
  );
}
