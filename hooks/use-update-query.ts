import { useQueryClient } from "@tanstack/react-query";
import { type Draft, produce } from "immer";
import {
  type QueryKey,
  type QueryParams,
  type QueryResult,
  queries
} from "@/lib/api/queries";
import type { Fn } from "@/types";

export function useUpdateQuery() {
  const client = useQueryClient();

  return <T extends QueryKey>(
    ...args: QueryParams<T> extends []
      ? [key: T, updater: (draft: Draft<QueryResult<T>>) => void]
      : [
          key: T,
          params: QueryParams<T>,
          updater: (draft: Draft<QueryResult<T>>) => void
        ]
  ) => {
    const key = args[0];
    const params = args[1] && typeof args[1] !== "function" ? args[1] : [];
    // biome-ignore lint/style/noNonNullAssertion: <>
    const updater = (typeof args[1] === "function" ? args[1] : args[2])!;

    const query = queries[key];

    client.setQueryData<QueryResult<T>>(
      (query.key as Fn)(...params),
      (cached) => {
        if (cached)
          return produce(cached, (draft) => {
            updater(draft);
          });

        return undefined;
      }
    );
  };
}
