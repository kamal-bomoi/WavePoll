import type { Poll, PollResponsesCursor, PollResponsesPage } from "@/types";
import { api } from "./client";

interface QueryConfig<TParams extends any[] = any[], TResult = any> {
  key: (...params: TParams) => readonly any[];
  fn: (...params: TParams) => Promise<TResult>;
}

export type Query = typeof queries;

export type QueryKey = keyof Query;

export type QueryResult<T extends QueryKey> = Awaited<
  ReturnType<Query[T]["fn"]>
>;

export type QueryParams<T extends QueryKey> = Parameters<Query[T]["fn"]>;

export const queries = {
  polls: {
    key: () => ["polls"],

    fn: (poll_ids: string[]): Promise<Poll[]> =>
      api.get("/polls", {
        params: {
          ids: poll_ids.join(",")
        }
      })
  },
  poll: {
    key: (poll_id: string) => ["poll", poll_id],
    fn: (poll_id: string): Promise<Poll> => api.get(`/polls/${poll_id}`)
  },
  responses: {
    key: (poll_id: string) => ["responses", poll_id],
    fn: (
      poll_id: string,
      cursor?: PollResponsesCursor
    ): Promise<PollResponsesPage> =>
      api.get(`/polls/${poll_id}/responses`, {
        params: {
          cursor_created_at: cursor?.created_at,
          cursor_id: cursor?.id
        }
      })
  }
} as const satisfies {
  [k: string]: QueryConfig;
};
