import {
  Button,
  Center,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon
} from "@mantine/core";
import { IconListSearch, IconLock } from "@tabler/icons-react";
import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient
} from "@tanstack/react-query";
import { WaveAlert } from "@/components/wave-alert";
import { queries } from "@/lib/api/queries";
import { useRealtime } from "@/lib/realtime-client";
import type { Poll, PollResponsesCursor, PollResponsesPage } from "@/types";
import { PAGINATION_LIMIT } from "@/utils/constants";

interface Props {
  poll: Poll;
  is_owner_view: boolean;
}

export function TextResponses({ poll, is_owner_view }: Props) {
  const query_client = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: queries.responses.key(poll.id),
    enabled: is_owner_view,
    initialPageParam: null as PollResponsesCursor | null,
    queryFn: ({ pageParam }) =>
      queries.responses.fn(poll.id, pageParam ?? undefined),
    getNextPageParam(last_page) {
      return last_page.next_cursor ?? undefined;
    }
  });

  useRealtime({
    channels: [`poll:${poll.id}`],
    events: ["poll.new_comment"],
    enabled: is_owner_view && poll.type === "text",
    onData({ data }) {
      query_client.setQueryData<InfiniteData<PollResponsesPage>>(
        queries.responses.key(poll.id),
        (cached) => {
          if (!cached?.pages.length) return cached;

          const first_page = cached.pages[0];

          if (!first_page) return cached;

          const already_present = cached.pages.some((page) =>
            page.items.some((item) => item.id === data.id)
          );

          if (already_present) return cached;

          const next_first_items = [data, ...first_page.items].slice(
            0,
            first_page.limit
          );

          const next_first_page: PollResponsesPage = {
            ...first_page,
            items: next_first_items
          };

          return {
            ...cached,
            pages: [next_first_page, ...cached.pages.slice(1)]
          };
        }
      );
    }
  });

  if (!is_owner_view)
    return (
      <Group gap={8} c="dimmed">
        <ThemeIcon size="sm" variant="light" color="gray">
          <IconLock size={14} />
        </ThemeIcon>
        <Text size="sm">
          Full text answers are only visible to the poll creator.
        </Text>
      </Group>
    );

  if (query.isPending)
    return (
      <Center>
        <Group align="center">
          <Loader color="indigo" size="sm" type="dots" />
          <Text c="dimmed" size="sm">
            Loading responses...
          </Text>
        </Group>
      </Center>
    );

  if (query.error) return <WaveAlert type="error" message={query.error} />;

  const text_responses = query.data.pages.flatMap((page) => page.items);
  const has_more = query.data.pages.at(-1)?.has_more ?? false;

  return (
    <Stack gap="sm">
      {!text_responses.length ? (
        <Text size="sm" c="dimmed">
          No text responses yet.
        </Text>
      ) : (
        <>
          <Text size="xs" c="dimmed">
            Showing {text_responses.length} response
            {text_responses.length === 1 ? "" : "s"}
          </Text>
          <ScrollArea.Autosize mah={360} scrollbarSize={8} type="hover">
            <Stack gap={8} pr={6}>
              {text_responses.map((response) => (
                <Paper key={response.id} withBorder p="sm">
                  <Text size="sm">{response.comment}</Text>
                </Paper>
              ))}
            </Stack>
          </ScrollArea.Autosize>
          {has_more && (
            <Button
              variant="light"
              size="sm"
              leftSection={<IconListSearch size={16} />}
              loading={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              Load {PAGINATION_LIMIT} more
            </Button>
          )}
        </>
      )}
    </Stack>
  );
}
