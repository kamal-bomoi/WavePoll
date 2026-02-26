import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { type Draft, produce } from "immer";
import { useCallback } from "react";

/**
 * Provide a memoized updater that applies immutable modifications to a React Query cache entry.
 *
 * @param key - The QueryKey that identifies the cached query to update.
 * @param updater - A function that receives a Draft of the cached value and applies mutations to it.
 * @returns A function that updates the cache entry for `key` by applying `updater` immutably; if the cached value is `undefined` the cache is left unchanged.
 */
export function useUpdateQuery() {
  const client = useQueryClient();

  return useCallback(
    <T>(key: QueryKey, updater: (draft: Draft<T>) => void) => {
      client.setQueryData<T>(key, (cached) => {
        if (cached === undefined) return undefined;

        return produce(cached, (draft) => {
          updater(draft);
        });
      });
    },
    [client]
  );
}
