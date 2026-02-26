import { Button } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import Link from "next/link";

/**
 * Renders an "Edit" button that navigates to the poll's edit page.
 *
 * @param poll_id - The poll identifier used to construct the edit URL (/studio/{poll_id}/edit)
 * @returns The button element configured to navigate to the poll edit route
 */
export function EditPollButton({ poll_id }: { poll_id: string }) {
  return (
    <Button
      component={Link}
      href={`/studio/${poll_id}/edit` as any}
      size="compact-sm"
      variant="filled"
      color="indigo"
      leftSection={<IconPencil size={14} />}
    >
      Edit
    </Button>
  );
}
