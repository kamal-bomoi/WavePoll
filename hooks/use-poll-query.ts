import { useQuery } from "./use-query";

export function usePollQuery(poll_id: string | undefined) {
  return useQuery("poll", [poll_id ?? ""], {
    enabled: !!poll_id
  });
}
