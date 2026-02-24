import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { env } from "@/env";
import { s3 } from "@/lib/s3";
import { route } from "@/utils/route";

export const DELETE = route<{ keys: string[] }>(
  async ({ body }) => {
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
