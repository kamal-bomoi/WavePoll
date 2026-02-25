import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { env } from "@/env";
import { s3 } from "@/lib/s3";
import { get_anon_id_strict } from "@/lib/session";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

export const DELETE = route<{ keys: string[] }>(
  async ({ body }) => {
    const anon_id = await get_anon_id_strict();
    const prefix = `options/${anon_id}/`;

    if (body.keys.some((key) => !is_owned_image_key(key, prefix)))
      throw WavePollError.Unauthorized(
        "You are not authorized to delete one or more image keys."
      );

    const command = new DeleteObjectsCommand({
      Bucket: env.S3_BUCKET,
      Delete: {
        Objects: body.keys.map((key) => ({ Key: key })),
        Quiet: true
      }
    });

    await s3.send(command);

    return null;
  },
  {
    status: 204,
    schema: {
      body: z.object({
        keys: z.array(z.string()).min(1)
      })
    }
  }
);

function is_owned_image_key(key: string, prefix: string): boolean {
  return key.startsWith(prefix) && key.length > prefix.length;
}
