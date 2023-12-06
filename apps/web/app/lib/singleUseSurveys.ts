import { env } from "@fastform/lib/env.mjs";
import { decryptAES128, symmetricDecrypt, symmetricEncrypt } from "@fastform/lib/crypto";
import cuid2 from "@paralleldrive/cuid2";

// generate encrypted single use id for the form
export const generateSurveySingleUseId = (isEncrypted: boolean): string => {
  const cuid = cuid2.createId();
  if (!isEncrypted) {
    return cuid;
  }

  const encryptedCuid = symmetricEncrypt(cuid, env.ENCRYPTION_KEY);
  return encryptedCuid;
};

// validate the form single use id
export const validateSurveySingleUseId = (surveySingleUseId: string): string | undefined => {
  try {
    let decryptedCuid: string | null = null;

    if (surveySingleUseId.length === 64) {
      if (!env.FORMBRICKS_ENCRYPTION_KEY) {
        throw new Error("FORMBRICKS_ENCRYPTION_KEY is not defined");
      }

      decryptedCuid = decryptAES128(env.FORMBRICKS_ENCRYPTION_KEY!, surveySingleUseId);
    } else {
      decryptedCuid = symmetricDecrypt(surveySingleUseId, env.ENCRYPTION_KEY);
    }

    if (cuid2.isCuid(decryptedCuid)) {
      return decryptedCuid;
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};
