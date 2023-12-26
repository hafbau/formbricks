import { FormInline } from "@/components/general/FormInline";
import { FormModal } from "@/components/general/FormModal";
import { addCustomThemeToDom, addStylesToDom } from "@/lib/styles";
import { FormInlineProps, FormModalProps } from "@/types/props";
import { h, render } from "preact";

export const renderFormInline = (props: FormInlineProps & { brandColor: string }) => {
  addStylesToDom();
  addCustomThemeToDom({ brandColor: props.brandColor });

  const { containerId, ...formProps } = props;
  const element = document.getElementById(containerId);
  if (!element) {
    throw new Error(`renderform: Element with id ${containerId} not found.`);
  }
  render(h(FormInline, formProps), element);
};

export const renderFormModal = (props: FormModalProps & { brandColor: string }) => {
  addStylesToDom();
  addCustomThemeToDom({ brandColor: props.brandColor });

  // add container element to DOM
  const element = document.createElement("div");
  element.id = "fastform-modal-container";
  document.body.appendChild(element);
  render(h(FormModal, props), element);
};
