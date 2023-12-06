import { verifyTokenForLinkSurvey } from "@fastform/lib/jwt";

export const getEmailVerificationStatus = async (
  surveyId: string,
  token: string
): Promise<"verified" | "not-verified" | "fishy"> => {
  if (!token) {
    return "not-verified";
  } else {
    try {
      const validateToken = await verifyTokenForLinkSurvey(token, surveyId);
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
