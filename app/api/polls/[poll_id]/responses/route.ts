import z from "zod";
import type { PollResponsesPage } from "@/types";
import { PAGINATION_LIMIT } from "@/utils/constants";
import { route } from "@/utils/route";

export const GET = route<
  undefined,
  { poll_id: string },
  { cursor_created_at?: string; cursor_id?: string }
>(
  async ({ params, query, supabase }) => {
    let request = supabase
      .from("votes")
      .select("id,option_id,rating,comment,created_at")
      .eq("poll_id", params.poll_id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(PAGINATION_LIMIT + 1);

    if (query.cursor_created_at && query.cursor_id)
      request = request.or(
        `created_at.lt.${query.cursor_created_at},and(created_at.eq.${query.cursor_created_at},id.lt.${query.cursor_id})`
      );

    const { data, error } = await request;

    if (error) throw error;

    const has_more = data.length > PAGINATION_LIMIT;
    const items = has_more ? data.slice(0, PAGINATION_LIMIT) : data;
    const last = items.at(-1);

    return {
      items,
      limit: PAGINATION_LIMIT,
      has_more,
      next_cursor:
        has_more && last ? { created_at: last.created_at, id: last.id } : null
    } satisfies PollResponsesPage;
  },
  {
    schema: {
      params: z.object({
        poll_id: z.string()
      }),
      query: z
        .object({
          cursor_created_at: z.string().optional(),
          cursor_id: z.string().optional()
        })
        .superRefine((value, ctx) => {
          const has_created_at = !!value.cursor_created_at;
          const has_id = !!value.cursor_id;

          if (has_created_at !== has_id)
            ctx.addIssue({
              code: "custom",
              message:
                "cursor_created_at and cursor_id must be provided together."
            });
        })
    }
  }
);
