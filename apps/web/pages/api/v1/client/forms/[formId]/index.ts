import { prisma } from "@fastform/database";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const formId = req.query.formId?.toString();

  if (!formId) {
    return res.status(400).json({ message: "Missing formId" });
  }

  // CORS
  if (req.method === "OPTIONS") {
    res.status(200).end();
  }
  // GET
  else if (req.method === "GET") {
    // get form
    const form = await prisma.form.findFirst({
      where: {
        id: formId,
        type: "link",
        // status: "inProgress",
      },
      select: {
        id: true,
        questions: true,
        thankYouCard: true,
        environmentId: true,
        status: true,
        redirectUrl: true,
        formClosedMessage: true,
      },
    });

    // if form does not exist, return 404
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // get brandColor from product using environmentId
    const product = await prisma.product.findFirst({
      where: {
        environments: {
          some: {
            id: form.environmentId,
          },
        },
      },
      select: {
        brandColor: true,
        linkformBranding: true,
      },
    });

    if (form.status !== "inProgress") {
      return res.status(403).json({
        message: "Form not running",
        reason: form.status,
        brandColor: product?.brandColor,
        fastformSignature: product?.linkformBranding,
        formClosedMessage: form?.formClosedMessage,
      });
    }

    // if form exists, return form
    return res.status(200).json({
      ...form,
      brandColor: product?.brandColor,
      fastformSignature: product?.linkformBranding,
    });
  }

  // Unknown HTTP Method
  else {
    throw new Error(`The HTTP ${req.method} method is not supported by this route.`);
  }
}
