import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { env } from "@/env";
import { db } from "@/lib/db/client";
import { options, polls } from "@/lib/db/schema";
import { schedule_poll_end } from "@/lib/qstash";
import { emit_poll_updated } from "@/lib/realtime";
import { s3 } from "@/lib/s3";
import { PollIdSchema, UpdatePollSchema } from "@/lib/schemas";
import { assert_owner } from "@/lib/session";
import { nanoid } from "@/utils/nanoid";
import { is_poll_ended } from "@/utils/poll-generic";
import { get_poll } from "@/utils/poll-server";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

export const GET = route(
  async ({ params }) => {
    return get_poll(params.poll_id);
  },
  {
    schema: {
      params: PollIdSchema
    }
  }
);

export const PUT = route(
  async ({ params, body }) => {
    const poll = await db.query.polls.findFirst({
      columns: {
        id: true,
        owner_id: true,
        status: true,
        type: true,
        end_at: true
      },
      with: {
        options: {
          columns: {
            value: true
          }
        }
      },
      where: eq(polls.id, params.poll_id)
    });

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    await assert_owner(poll.owner_id);

    if (is_poll_ended({ end_at: poll.end_at }))
      throw WavePollError.BadRequest("This poll has already ended.");

    if (poll.status !== "draft")
      throw WavePollError.BadRequest("Only draft polls can be edited.");

    const image_prefix = `options/${poll.owner_id}/`;

    if (
      body.type === "image" &&
      (body.options ?? []).some(
        (key) =>
          !key.startsWith(image_prefix) || key.length <= image_prefix.length
      )
    )
      throw WavePollError.Unauthorized(
        "One or more image options are not owned by this session."
      );

    const old_image_keys =
      poll.type === "image" ? poll.options.map((option) => option.value) : [];
    const next_image_keys = body.type === "image" ? (body.options ?? []) : [];
    const image_keys_to_delete = old_image_keys.filter(
      (key) => !next_image_keys.includes(key)
    );

    await db.transaction(async (tx) => {
      const updated = await tx
        .update(polls)
        .set({
          title: body.title.trim(),
          status: body.status,
          description: body.description,
          type: body.type,
          end_at: new Date(body.end_at),
          reaction_emojis: body.reaction_emojis,
          ...(body.owner_email !== undefined && {
            owner_email: body.owner_email
          })
        })
        .where(and(eq(polls.id, poll.id), eq(polls.status, "draft")))
        .returning({ id: polls.id });

      if (!updated.length)
        throw WavePollError.Conflict(
          "Only draft polls can be edited. Refresh and try again."
        );

      await tx.delete(options).where(eq(options.poll_id, poll.id));

      if (
        (body.type === "single" || body.type === "image") &&
        body.options?.length
      )
        await tx.insert(options).values(
          body.options.map((value) => ({
            id: nanoid.id(),
            poll_id: poll.id,
            value
          }))
        );
    });

    if (image_keys_to_delete.length)
      await s3
        .send(
          new DeleteObjectsCommand({
            Bucket: env.S3_BUCKET,
            Delete: {
              Objects: image_keys_to_delete.map((key) => ({ Key: key })),
              Quiet: true
            }
          })
        )
        .catch((error) => {
          if (env.NODE_ENV === "development") console.error(error);

          Sentry.captureException(error);
        });

    const next_poll = await get_poll(poll.id);

    const has_gone_live = poll.status === "draft" && body.status === "live";

    await Promise.all([
      emit_poll_updated(next_poll),
      env.NODE_ENV === "production" && has_gone_live
        ? schedule_poll_end(next_poll)
        : Promise.resolve()
    ]);

    return next_poll;
  },
  {
    schema: {
      params: PollIdSchema,
      body: UpdatePollSchema
    }
  }
);

export const DELETE = route(
  async ({ params }) => {
    const poll = await db.query.polls.findFirst({
      columns: {
        id: true,
        owner_id: true,
        type: true
      },
      with: {
        options: {
          columns: {
            value: true
          }
        }
      },
      where: eq(polls.id, params.poll_id)
    });

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    await assert_owner(poll.owner_id);

    await db.delete(polls).where(eq(polls.id, poll.id));

    if (poll.type === "image")
      await s3
        .send(
          new DeleteObjectsCommand({
            Bucket: env.S3_BUCKET,
            Delete: {
              Objects: poll.options.map((option) => ({ Key: option.value })),
              Quiet: true
            }
          })
        )
        .catch((error) => {
          if (env.NODE_ENV === "development") console.error(error);

          Sentry.captureException(error);
        });

    return null;
  },
  {
    status: 204,
    schema: {
      params: PollIdSchema
    }
  }
);
