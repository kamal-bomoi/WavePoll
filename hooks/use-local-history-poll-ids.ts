import { useLocalStorage } from "@mantine/hooks";
import { POLL_HISTORY_IDS_KEY } from "@/utils/constants";

/**
 * Provides access to the stored poll history IDs in local storage.
 *
 * @returns A tuple `[string[] | undefined, (value: string[] | undefined) => void]` where the first element is the current array of poll history IDs (or `undefined` if none) and the second is a setter to update or remove that value.
 */
export function useLocalHistoryPollIds() {
  return useLocalStorage<string[] | undefined>({
    key: POLL_HISTORY_IDS_KEY,
    defaultValue: undefined
  });
}
