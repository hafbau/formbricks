import { env } from "@fastform/lib/env.mjs";
import { responses } from "@/app/lib/api/response";
import { UPLOADS_DIR } from "@fastform/lib/constants";
import { getLocalFile, getS3File } from "@fastform/lib/storage/service";
import { notFound } from "next/navigation";
import path from "path";

const getFile = async (environmentId: string, accessType: string, fileName: string) => {
  if (!env.S3_ACCESS_KEY || !env.S3_SECRET_KEY || !env.S3_REGION || !env.S3_BUCKET_NAME) {
    try {
      const { fileBuffer, metaData } = await getLocalFile(
        path.join(UPLOADS_DIR, environmentId, accessType, fileName)
      );

      return new Response(fileBuffer, {
        headers: {
          "Content-Type": metaData.contentType,
          "Content-Disposition": "attachment",
        },
      });
    } catch (err) {
      notFound();
    }
  }

  try {
    const signedUrl = await getS3File(`${environmentId}/${accessType}/${fileName}`);

    return new Response(null, {
      status: 302,
      headers: {
        Location: signedUrl,
      },
    });
  } catch (err) {
    if (err.name === "NoSuchKey") {
      return responses.notFoundResponse("File not found", fileName);
    } else {
      return responses.internalServerErrorResponse("Internal server error");
    }
  }
};

export default getFile;
