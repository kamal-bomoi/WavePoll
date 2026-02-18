import z from "zod";
import type { CreatePollPayload } from "@/types";
import { route } from "@/utils/route";

export const POST = route<CreatePollPayload>(() => {}, {
  status: 201,
  schema: {
    body: z.object({
      type: z.enum(["single", "multiple", "rating", "text"]),
      title: z.string(),
      description: z.string().optional(),
      owner_email: z.email().optional(),
      options: z.array(z.string()).optional(),
      start_at: z.iso.datetime().optional(),
      end_at: z.iso.datetime().optional(),
      reaction_emojis: z.array(z.string()).min(1).optional()
    })
  }
});

export const GET = route(() => {});
