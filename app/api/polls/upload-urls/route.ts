import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import z from "zod";
import { env } from "@/env";
import { s3 } from "@/lib/s3";
import type { UploadUrlsPayload } from "@/types";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_FILE_SIZE,
  MAX_OPTIONS,
  MIN_OPTIONS,
  SIGNED_URL_EXPIRY_SECONDS
} from "@/utils/constants";
import { nanoid } from "@/utils/nanoid";
import { route } from "@/utils/route";

export const POST = route<UploadUrlsPayload>(
  async ({ body }) => {
    const promises = body.files.map(async (file) => {
      const key = `options/${nanoid({ length: 6 })}`;

      const command = new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        ContentType: file.content_type,
        ContentLength: file.content_length,
        CacheControl: "public, max-age=31536000, immutable"
      });

      const url = await getSignedUrl(s3, command, {
        expiresIn: SIGNED_URL_EXPIRY_SECONDS
      });

      return {
        key,
        url
      };
    });

    return Promise.all(promises);
  },
  {
    schema: {
      body: z.object({
        files: z
          .array(
            z.object({
              content_type: z.enum(ALLOWED_CONTENT_TYPES, {
                error: `Invalid image type. Allowed types: ${ALLOWED_CONTENT_TYPES.map(
                  (t) => t.replace("image/", "").toUpperCase()
                ).join(", ")}.`
              }),
              content_length: z.number().int().min(1).max(MAX_FILE_SIZE, {
                error: "Image size must not exceed 5MB."
              })
            })
          )
          .min(MIN_OPTIONS)
          .max(MAX_OPTIONS)
      })
    }
  }
);
