import { TFormLogic } from "@fastform/types/forms";

export function evaluateCondition(logic: TFormLogic, responseValue: any): boolean {
  switch (logic.condition) {
    case "equals":
      return (
        (Array.isArray(responseValue) && responseValue.length === 1 && responseValue.includes(logic.value)) ||
        responseValue?.toString() === logic.value
      );
    case "notEquals":
      return responseValue !== logic.value;
    case "lessThan":
      return logic.value !== undefined && responseValue < logic.value;
    case "lessEqual":
      return logic.value !== undefined && responseValue <= logic.value;
    case "greaterThan":
      return logic.value !== undefined && responseValue > logic.value;
    case "greaterEqual":
      return logic.value !== undefined && responseValue >= logic.value;
    case "includesAll":
      return (
        Array.isArray(responseValue) &&
        Array.isArray(logic.value) &&
        logic.value.every((v) => responseValue.includes(v))
      );
    case "includesOne":
      return (
        Array.isArray(responseValue) &&
        Array.isArray(logic.value) &&
        logic.value.some((v) => responseValue.includes(v))
      );
    case "accepted":
      return responseValue === "accepted";
    case "clicked":
      return responseValue === "clicked";
    case "submitted":
      if (typeof responseValue === "string") {
        return responseValue !== "dismissed" && responseValue !== "" && responseValue !== null;
      } else if (Array.isArray(responseValue)) {
        return responseValue.length > 0;
      } else if (typeof responseValue === "number") {
        return responseValue !== null;
      }
      return false;
    case "skipped":
      return (
        (Array.isArray(responseValue) && responseValue.length === 0) ||
        responseValue === "" ||
        responseValue === null ||
        responseValue === undefined ||
        responseValue === "dismissed"
      );
    case "uploaded":
      if (Array.isArray(responseValue)) {
        return responseValue.length > 0;
      } else {
        return responseValue !== "skipped" && responseValue !== "" && responseValue !== null;
      }
    case "notUploaded":
      return (
        (Array.isArray(responseValue) && responseValue.length === 0) ||
        responseValue === "" ||
        responseValue === null ||
        responseValue === "skipped"
      );
    default:
      return false;
  }
}
