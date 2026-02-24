import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { z } from "zod";
import { env } from "@/env";
import { r2 } from "@/lib/r2";
import { route } from "@/utils/route";

export const DELETE = route<{ keys: string[] }>(
  async ({ body }) => {
    const command = new DeleteObjectsCommand({
      Bucket: env.R2_BUCKET,
      Delete: {
        Objects: body.keys.map((key) => ({ Key: key })),
        Quiet: true
      }
    });

    await r2.send(command);

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
