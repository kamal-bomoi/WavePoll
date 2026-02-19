import z from "zod";
import { get_poll } from "@/utils/poll";
import { route } from "@/utils/route";

export const GET = route<undefined, { poll_id: string }>(
  async ({ params, supabase }) => {
    return get_poll(supabase, params.poll_id);
  },
  {
    schema: {
      params: z.object({
        poll_id: z.string()
      })
    }
  }
);
