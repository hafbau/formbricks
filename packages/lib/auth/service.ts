import crypto from "crypto";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import { prisma } from "@fastform/database";
import { symmetricDecrypt, symmetricEncrypt } from "../crypto";
import { verifyPassword } from "../auth";
import { totpAuthenticatorCheck } from "../totp";
import { profileCache } from "../profile/cache";
import { ENCRYPTION_KEY } from "../constants";

export const setupTwoFactorAuth = async (
  userId: string,
  password: string
): Promise<{
  secret: string;
  keyUri: string;
  dataUri: string;
  backupCodes: string[];
}> => {
  // This generates a secret 32 characters in length. Do not modify the number of
  // bytes without updating the sanity checks in the enable and login endpoints.
  const secret = authenticator.generateSecret(20);

  // generate backup codes with 10 character length
  const backupCodes = Array.from(Array(10), () => crypto.randomBytes(5).toString("hex"));

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("User does not have a password set");
  }

  if (user.identityProvider !== "email") {
    throw new Error("Third party login is already enabled");
  }

  const isCorrectPassword = await verifyPassword(password, user.password);

  if (!isCorrectPassword) {
    throw new Error("Incorrect password");
  }

  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key not found");
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      backupCodes: symmetricEncrypt(JSON.stringify(backupCodes), ENCRYPTION_KEY),
      twoFactorEnabled: false,
      twoFactorSecret: symmetricEncrypt(secret, ENCRYPTION_KEY),
    },
  });

  const name = user.email || user.name || user.id.toString();
  const keyUri = authenticator.keyuri(name, "Fastform", secret);
  const dataUri = await qrcode.toDataURL(keyUri);

  return { secret, keyUri, dataUri, backupCodes };
};

export const enableTwoFactorAuth = async (id: string, code: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("User does not have a password set");
  }

  if (user.identityProvider !== "email") {
    throw new Error("Third party login is already enabled");
  }

  if (user.twoFactorEnabled) {
    throw new Error("Two factor authentication is already enabled");
  }

  if (!user.twoFactorSecret) {
    throw new Error("Two factor setup has not been completed");
  }

  if (!ENCRYPTION_KEY) {
    throw new Error("Encryption key not found");
  }

  const secret = symmetricDecrypt(user.twoFactorSecret, ENCRYPTION_KEY);
  if (secret.length !== 32) {
    throw new Error("Invalid secret");
  }

  const isValidCode = totpAuthenticatorCheck(code, secret);
  if (!isValidCode) {
    throw new Error("Invalid code");
  }

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      twoFactorEnabled: true,
    },
  });

  profileCache.revalidate({
    id,
  });

  return {
    message: "Two factor authentication enabled",
  };
};

type TDisableTwoFactorAuthParams = {
  code: string;
  password: string;
  backupCode?: string;
};

export const disableTwoFactorAuth = async (id: string, params: TDisableTwoFactorAuthParams) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.password) {
    throw new Error("User does not have a password set");
  }

  if (!user.twoFactorEnabled) {
    throw new Error("Two factor authentication is not enabled");
  }

  if (user.identityProvider !== "email") {
    throw new Error("Third party login is already enabled");
  }

  const { code, password, backupCode } = params;
  const isCorrectPassword = await verifyPassword(password, user.password);

  if (!isCorrectPassword) {
    throw new Error("Incorrect password");
  }

  // if user has 2fa and using backup code
  if (user.twoFactorEnabled && backupCode) {
    if (!ENCRYPTION_KEY) {
      throw new Error("Encryption key not found");
    }

    if (!user.backupCodes) {
      throw new Error("Missing backup codes");
    }

    const backupCodes = JSON.parse(symmetricDecrypt(user.backupCodes, ENCRYPTION_KEY));

    // check if user-supplied code matches one
    const index = backupCodes.indexOf(backupCode.replaceAll("-", ""));
    if (index === -1) {
      throw new Error("Incorrect backup code");
    }

    // we delete all stored backup codes at the end, no need to do this here

    // if user has 2fa and NOT using backup code, try totp
  } else if (user.twoFactorEnabled) {
    if (!code) {
      throw new Error("Second factor required");
    }

    if (!user.twoFactorSecret) {
      throw new Error("Two factor setup has not been completed");
    }

    if (!ENCRYPTION_KEY) {
      throw new Error("Encryption key not found");
    }

    const secret = symmetricDecrypt(user.twoFactorSecret, ENCRYPTION_KEY);
    if (secret.length !== 32) {
      throw new Error("Invalid secret");
    }

    const isValidCode = totpAuthenticatorCheck(code, secret);
    if (!isValidCode) {
      throw new Error("Invalid code");
    }
  }

  await prisma.user.update({
    where: {
      id,
    },
    data: {
      backupCodes: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
  });

  profileCache.revalidate({
    id,
  });

  return {
    message: "Two factor authentication disabled",
  };
};
