import { formInline } from "@/components/general/formInline";
import { formModal } from "@/components/general/formModal";
import { addCustomThemeToDom, addStylesToDom } from "@/lib/styles";
import { formInlineProps, formModalProps } from "@/types/props";
import { h, render } from "preact";

export const renderformInline = (props: formInlineProps & { brandColor: string }) => {
  addStylesToDom();
  addCustomThemeToDom({ brandColor: props.brandColor });

  const { containerId, ...formProps } = props;
  const element = document.getElementById(containerId);
  if (!element) {
    throw new Error(`renderform: Element with id ${containerId} not found.`);
  }
  render(h(formInline, formProps), element);
};

export const renderformModal = (props: formModalProps & { brandColor: string }) => {
  addStylesToDom();
  addCustomThemeToDom({ brandColor: props.brandColor });

  // add container element to DOM
  const element = document.createElement("div");
  element.id = "fastform-modal-container";
  document.body.appendChild(element);
  render(h(formModal, props), element);
};
