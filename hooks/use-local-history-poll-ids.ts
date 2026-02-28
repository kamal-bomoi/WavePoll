import { useLocalStorage } from "@mantine/hooks";
import { POLL_HISTORY_IDS_KEY } from "@/utils/constants";

export function useLocalHistoryPollIds() {
  return useLocalStorage<string[] | undefined>({
    key: POLL_HISTORY_IDS_KEY,
    defaultValue: undefined
  });
}
