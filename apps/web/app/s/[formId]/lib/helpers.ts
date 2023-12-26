import { verifyTokenForLinkForm } from "@fastform/lib/jwt";

export const getEmailVerificationStatus = async (
  formId: string,
  token: string
): Promise<"verified" | "not-verified" | "fishy"> => {
  if (!token) {
    return "not-verified";
  } else {
    try {
      const validateToken = await verifyTokenForLinkForm(token, formId);
      if (validateToken) {
        return "verified";
      } else {
        return "fishy";
      }
    } catch (error) {
      return "not-verified";
    }
  }
};
