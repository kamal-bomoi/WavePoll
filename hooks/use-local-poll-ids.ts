import { useLocalStorage } from "@mantine/hooks";
import { POLL_IDS_KEY } from "@/utils/constants";

export function useLocalPollIds() {
  return useLocalStorage<string[] | undefined>({
    key: POLL_IDS_KEY,
    defaultValue: undefined
  });
}
