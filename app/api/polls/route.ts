import dayjs from "dayjs";
import z from "zod";
import { env } from "@/env";
import { db } from "@/lib/db/client";
import { options, poll_status, poll_type, polls } from "@/lib/db/schema";
import { schedule_poll_end } from "@/lib/qstash";
import { emit_poll_updated } from "@/lib/realtime";
import { get_or_set_anon_id } from "@/lib/session";
import type { CreatePollPayload } from "@/types";
import { MAX_OPTIONS, MIN_OPTIONS } from "@/utils/constants";
import { nanoid } from "@/utils/nanoid";
import { get_owner_polls, get_poll, get_polls } from "@/utils/poll-server";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

export const POST = route<CreatePollPayload>(
  async ({ body }) => {
    const anon_id = await get_or_set_anon_id();
    const prefix = `options/${anon_id}/`;

    if (
      body.type === "image" &&
      (body.options ?? []).some(
        (key) => !key.startsWith(prefix) || key.length <= prefix.length
      )
    )
      throw WavePollError.Unauthorized(
        "One or more image options are not owned by this session."
      );

    const poll = await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(polls)
        .values({
          id: nanoid.id(),
          owner_id: anon_id,
          title: body.title.trim(),
          type: body.type,
          status: body.status,
          description: body.description,
          owner_email: body.owner_email,
          end_at: new Date(body.end_at),
          reaction_emojis: body.reaction_emojis
        })
        .returning({ id: polls.id });

      if (!inserted)
        throw WavePollError.InternalServerError("Failed to insert poll.");

      if (
        (body.type === "single" || body.type === "image") &&
        body.options?.length
      )
        await tx.insert(options).values(
          body.options.map((value) => ({
            id: nanoid.id(),
            poll_id: inserted.id,
            value
          }))
        );

      return inserted;
    });

    const next_poll = await get_poll(poll.id);

    await Promise.all([
      emit_poll_updated(next_poll),
      env.NODE_ENV === "production" && next_poll.status === "live"
        ? schedule_poll_end(next_poll)
        : Promise.resolve()
    ]);

    return next_poll;
  },
  {
    status: 201,
    schema: {
      body: z
        .object({
          owner_email: z.email().nullable(),
          title: z
            .string()
            .trim()
            .min(3, "Title must be at least 3 characters long.")
            .max(80, "Title must be at most 80 characters long."),
          description: z
            .string()
            .max(300, "Description must be at most 300 characters long.")
            .nullable(),
          type: z.enum(poll_type.enumValues),
          status: z.enum(poll_status.enumValues),
          reaction_emojis: z.array(z.string()).min(1).nullable(),
          end_at: z.iso.datetime(),
          options: z
            .array(z.string())
            .min(MIN_OPTIONS)
            .max(MAX_OPTIONS)
            .nullable()
        })
        .superRefine((body, ctx) => {
          const end_at = dayjs(body.end_at);
          const min_time = dayjs().add(5, "minute");

          if (!end_at.isValid() || end_at.isBefore(min_time))
            ctx.addIssue({
              code: "custom",
              path: ["end_at"],
              message: "End time must be at least 5 minutes from now."
            });

          if (
            (body.type === "single" || body.type === "image") &&
            !body.options
          )
            ctx.addIssue({
              code: "custom",
              path: ["options"],
              message: "Options are required for single choice and image polls."
            });
        })
    }
  }
);

export const GET = route<
  undefined,
  Record<string, string>,
  { ids?: string | undefined }
>(
  async ({ query }) => {
    if (query.ids) return get_polls(query.ids.split(",").filter(Boolean));

    const anon_id = await get_or_set_anon_id();

    return get_owner_polls(anon_id);
  },
  {
    schema: {
      query: z.object({
        ids: z.string().optional()
      })
    }
  }
);
