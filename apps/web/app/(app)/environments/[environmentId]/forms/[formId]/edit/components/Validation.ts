// extend this object in order to add more validation rules

import {
  TFormConsentQuestion,
  TFormMultipleChoiceMultiQuestion,
  TFormMultipleChoiceSingleQuestion,
  TFormPictureSelectionQuestion,
  TFormQuestion,
} from "@fastform/types/forms";

const validationRules = {
  multipleChoiceMulti: (question: TFormMultipleChoiceMultiQuestion) => {
    return !question.choices.some((element) => element.label.trim() === "");
  },
  multipleChoiceSingle: (question: TFormMultipleChoiceSingleQuestion) => {
    return !question.choices.some((element) => element.label.trim() === "");
  },
  consent: (question: TFormConsentQuestion) => {
    return question.label.trim() !== "";
  },
  pictureSelection: (question: TFormPictureSelectionQuestion) => {
    return question.choices.length >= 2;
  },
  defaultValidation: (question: TFormQuestion) => {
    return question.headline.trim() !== "";
  },
};

const validateQuestion = (question) => {
  const specificValidation = validationRules[question.type];
  const defaultValidation = validationRules.defaultValidation;

  const specificValidationResult = specificValidation ? specificValidation(question) : true;
  const defaultValidationResult = defaultValidation(question);

  // Return true only if both specific and default validation pass
  return specificValidationResult && defaultValidationResult;
};

export { validateQuestion };
