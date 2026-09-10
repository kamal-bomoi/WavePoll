import { and, desc, eq, lt, or } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { polls, votes } from "@/lib/db/schema";
import { PaginationSchema, PollIdSchema } from "@/lib/schemas";
import { assert_owner } from "@/lib/session";
import type { PollResponsesPage } from "@/types";
import { PAGINATION_LIMIT } from "@/utils/constants";
import { route } from "@/utils/route";
import { WavePollError } from "@/utils/wave-poll-error";

export const GET = route(
  async ({ params, query }) => {
    const poll = await db.query.polls.findFirst({
      columns: { id: true, owner_id: true },
      where: eq(polls.id, params.poll_id)
    });

    if (!poll) throw WavePollError.NotFound("Poll does not exist.");

    await assert_owner(poll.owner_id);

    const cursor_condition =
      query.cursor_created_at && query.cursor_id
        ? or(
            lt(votes.created_at, new Date(query.cursor_created_at)),
            and(
              eq(votes.created_at, new Date(query.cursor_created_at)),
              lt(votes.id, query.cursor_id)
            )
          )
        : undefined;

    const data = await db
      .select({
        id: votes.id,
        option_id: votes.option_id,
        rating: votes.rating,
        comment: votes.comment,
        created_at: votes.created_at
      })
      .from(votes)
      .where(and(eq(votes.poll_id, params.poll_id), cursor_condition))
      .orderBy(desc(votes.created_at), desc(votes.id))
      .limit(PAGINATION_LIMIT + 1);

    const has_more = data.length > PAGINATION_LIMIT;
    const items = has_more ? data.slice(0, PAGINATION_LIMIT) : data;
    const last = items.at(-1);

    return {
      items,
      limit: PAGINATION_LIMIT,
      has_more,
      next_cursor:
        has_more && last
          ? { created_at: last.created_at.toISOString(), id: last.id }
          : null
    } satisfies PollResponsesPage;
  },
  {
    schema: {
      params: PollIdSchema,
      query: PaginationSchema
    }
  }
);
