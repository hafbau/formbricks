// extend this object in order to add more validation rules

import {
  TformConsentQuestion,
  TformMultipleChoiceMultiQuestion,
  TformMultipleChoiceSingleQuestion,
  TformPictureSelectionQuestion,
  TformQuestion,
} from "@fastform/types/forms";

const validationRules = {
  multipleChoiceMulti: (question: TformMultipleChoiceMultiQuestion) => {
    return !question.choices.some((element) => element.label.trim() === "");
  },
  multipleChoiceSingle: (question: TformMultipleChoiceSingleQuestion) => {
    return !question.choices.some((element) => element.label.trim() === "");
  },
  consent: (question: TformConsentQuestion) => {
    return question.label.trim() !== "";
  },
  pictureSelection: (question: TformPictureSelectionQuestion) => {
    return question.choices.length >= 2;
  },
  defaultValidation: (question: TformQuestion) => {
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
