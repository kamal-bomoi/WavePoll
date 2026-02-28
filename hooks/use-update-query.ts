import { type QueryKey, useQueryClient } from "@tanstack/react-query";
import { type Draft, produce } from "immer";
import { useCallback } from "react";

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
