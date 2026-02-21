import z from "zod";
import type { PollStatus } from "@/types";
import { get_poll, is_poll_ended } from "@/utils/poll";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

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

export const PATCH = route<{ status: PollStatus }, { poll_id: string }>(
  async ({ params, body, supabase }) => {
    const { data: poll, error: poll_error } = await supabase
      .from("polls")
      .select("id,status,end_at")
      .eq("id", params.poll_id)
      .maybeSingle();

    if (poll_error) throw poll_error;

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    if (poll.status === body.status) return get_poll(supabase, poll.id);

    const has_ended = is_poll_ended(poll);

    if (body.status === "live" && has_ended)
      throw WavePollError.BadRequest(
        "Cannot publish a poll with an end time in the past."
      );

    if (body.status === "draft" && has_ended)
      throw WavePollError.BadRequest("Cannot unpublish a poll that has ended.");

    const { error: update_error } = await supabase
      .from("polls")
      .update({
        status: body.status
      })
      .eq("id", poll.id);

    if (update_error) throw update_error;

    return get_poll(supabase, poll.id);
  },
  {
    schema: {
      params: z.object({
        poll_id: z.string()
      }),
      body: z.object({
        status: z.enum(["draft", "live"])
      })
    }
  }
);

export const DELETE = route<undefined, { poll_id: string }>(
  async ({ params, supabase }) => {
    const { error, count } = await supabase
      .from("polls")
      .delete({ count: "exact" })
      .eq("id", params.poll_id);

    if (error) throw error;

    if (!count) throw WavePollError.NotFound("Poll does not exist.");

    return null;
  },
  {
    status: 204,
    schema: {
      params: z.object({
        poll_id: z.string()
      })
    }
  }
);
