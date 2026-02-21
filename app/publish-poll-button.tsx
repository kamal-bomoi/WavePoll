import { Button } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useMutation } from "@/hooks/use-mutation";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import type { Poll } from "@/types";

export function PublishPollButton({ poll }: { poll: Poll }) {
  const mutation = useMutation("publish poll");
  const update_query = useUpdateQuery();

  return (
    <Button
      size="compact-sm"
      variant="filled"
      color="indigo"
      leftSection={<IconPlayerPlay size={14} />}
      loading={mutation.isPending}
      onClick={() => {
        if (!window.confirm("Are you sure you want to publish this poll?"))
          return;

        mutation.mutate(
          { poll_id: poll.id },
          {
            onSuccess: (next) => {
              update_query<Poll[]>(queries.polls.key(), (draft) => {
                const item = draft.find((p) => p.id === poll.id);

                if (item) item.status = next.status;
              });
            }
          }
        );
      }}
    >
      Publish
    </Button>
  );
}
