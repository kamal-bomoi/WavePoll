import { Button } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useLocalPollIds } from "@/hooks/use-local-poll-ids";
import { useMutation } from "@/hooks/use-mutation";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import type { Poll } from "@/types";

export function DeletePollButton({ poll }: { poll: Poll }) {
  const mutation = useMutation("delete poll");
  const [, set_poll_ids] = useLocalPollIds();
  const update_query = useUpdateQuery();

  return (
    <Button
      size="compact-sm"
      variant="outline"
      color="red"
      leftSection={<IconTrash size={14} />}
      loading={mutation.isPending}
      onClick={() => {
        if (!window.confirm("Are you sure you want to delete this poll?"))
          return;

        mutation.mutate(
          { poll_id: poll.id },
          {
            onSuccess: () => {
              set_poll_ids((prev) => prev?.filter((id) => id !== poll.id));

              update_query<Poll[]>(queries.polls.key(), (draft) => {
                const index = draft.findIndex((p) => p.id === poll.id);

                if (index >= 0) draft.splice(index, 1);
              });
            }
          }
        );
      }}
    >
      Delete
    </Button>
  );
}
