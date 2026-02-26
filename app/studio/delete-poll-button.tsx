import { Button } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useMutation } from "@/hooks/use-mutation";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import type { Poll } from "@/types";

/**
 * Render a red outlined "Delete" button that deletes the provided poll after user confirmation and removes it from the cached polls list on success.
 *
 * @param poll - The poll to delete when the button is confirmed
 * @returns The button element which, when clicked and confirmed, issues a delete mutation for `poll` and updates the local polls cache on success
 */
export function DeletePollButton({ poll }: { poll: Poll }) {
  const mutation = useMutation("delete poll");
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
