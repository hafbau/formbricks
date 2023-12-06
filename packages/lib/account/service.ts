import { prisma } from "@fastform/database";
import { Prisma } from "@prisma/client";
import { DatabaseError } from "@fastform/types/errors";

import { validateInputs } from "../utils/validate";
import { ZAccountInput, TAccountInput, TAccount } from "@fastform/types/account";

export const createAccount = async (accountData: TAccountInput): Promise<TAccount> => {
  validateInputs([accountData, ZAccountInput]);

  try {
    const account = await prisma.account.create({
      data: accountData,
    });
    return account;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};
