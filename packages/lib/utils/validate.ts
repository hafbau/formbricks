import z from "zod";
import { ValidationError } from "@fastform/types/errors";

type ValidationPair = [any, z.ZodSchema<any>];

export const validateInputs = (...pairs: ValidationPair[]): void => {
  for (const [value, schema] of pairs) {
    const inputValidation = schema.safeParse(value);

    if (!inputValidation.success) {
      console.error(`Validation failed for ${JSON.stringify(schema)}: ${inputValidation.error.message}`);
      throw new ValidationError("Validation failed");
    }
  }
};
