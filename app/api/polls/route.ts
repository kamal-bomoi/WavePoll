import dayjs from "dayjs";
import z from "zod";
import type { CreatePollPayload, PollRow } from "@/types";
import { nanoid } from "@/utils/nanoid";
import { get_poll, get_polls } from "@/utils/poll";
import { route } from "@/utils/route";

export const POST = route<CreatePollPayload>(
  async ({ body, supabase }) => {
    const { data: poll, error: create_error } = await supabase
      .from("polls")
      .insert({
        id: nanoid.id(),
        title: body.title.trim(),
        type: body.type,
        status: body.status,
        description: body.description ?? null,
        owner_email: body.owner_email ?? null,
        end_at: body.end_at ?? null,
        reaction_emojis: body.reaction_emojis ?? null
      })
      .select("*")
      .single<PollRow>();

    if (create_error) throw create_error;

    if (body.type === "single") {
      const { error: options_error } = await supabase.from("options").insert(
        body.options!.map((value) => ({
          id: nanoid.id(),
          poll_id: poll.id,
          value
        }))
      );

      if (options_error) {
        await supabase.from("polls").delete().eq("id", poll.id);

        throw options_error;
      }
    }

    return get_poll(supabase, poll.id);
  },
  {
    status: 201,
    schema: {
      body: z
        .object({
          type: z.enum(["single", "rating", "text"]),
          title: z.string().trim().min(1),
          status: z.enum(["draft", "live"]),
          description: z.string().trim().optional(),
          owner_email: z.email().optional(),
          options: z.array(z.string().trim()).optional(),
          end_at: z.iso.datetime().optional(),
          reaction_emojis: z.array(z.string()).min(1).optional()
        })
        .superRefine((body, ctx) => {
          if (body.end_at) {
            const end_at = dayjs(body.end_at);
            const min_time = dayjs().add(5, "minute");

            if (!end_at.isValid() || end_at.isBefore(min_time))
              ctx.addIssue({
                code: "custom",
                path: ["end_at"],
                message: "End time must be at least 5 minutes in the future"
              });
          }

          if (
            body.type === "single" &&
            (!body.options || body.options.length < 2)
          )
            ctx.addIssue({
              code: "custom",
              path: ["options"],
              message: "Single choice polls require at least 2 options."
            });
        })
    }
  }
);

export const GET = route<undefined, Record<string, string>, { ids: string }>(
  async ({ query, supabase }) => {
    const ids = query.ids.split(",");

    return get_polls(supabase, ids);
  },
  {
    schema: {
      query: z.object({
        ids: z.string()
      })
    }
  }
);
