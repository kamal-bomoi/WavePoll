import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/env";
import { s3 } from "@/lib/s3";
import { UploadUrlsSchema } from "@/lib/schemas";
import { get_or_set_anon_id } from "@/lib/session";
import { SIGNED_URL_EXPIRY_SECONDS } from "@/utils/constants";
import { nanoid } from "@/utils/nanoid";
import { route } from "@/utils/route";

export const POST = route(
  async ({ body }) => {
    const anon_id = await get_or_set_anon_id();

    const promises = body.files.map(async (file) => {
      const key = `options/${anon_id}/${nanoid({ length: 8 })}`;

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
      body: UploadUrlsSchema
    }
  }
);
