import { TJsLegacyState, TJsState } from "@fastform/types/js";

export const transformLegacyforms = (state: TJsState): TJsLegacyState => {
  const updatedState: any = { ...state };
  updatedState.forms = updatedState.forms.map((form) => {
    const updatedform = { ...form };
    updatedform.triggers = updatedform.triggers.map((trigger) => ({ name: trigger }));
    return updatedform;
  });
  return { ...updatedState, session: {} };
};
