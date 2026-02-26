import { useQuery } from "./use-query";

/**
 * Creates a query hook for fetching poll data for a given poll ID.
 *
 * @param poll_id - The poll identifier; when `undefined` the query is disabled.
 * @returns The query result object for the poll (status, data, error, and related controls).
 */
export function usePollQuery(poll_id: string | undefined) {
  return useQuery("poll", [poll_id ?? ""], {
    enabled: !!poll_id,
    refetchOnMount: "always"
  });
}
