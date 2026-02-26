"use client";

import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

/**
 * Renders a "New Poll" button with a leading plus icon that navigates to "/studio" when clicked.
 *
 * @returns The Button React element which, when clicked, pushes the "/studio" route.
 */
export function NewPollButton() {
  const router = useRouter();

  return (
    <Button
      leftSection={<IconPlus size={16} />}
      color="indigo"
      variant="light"
      onClick={() => router.push("/studio")}
    >
      New Poll
    </Button>
  );
}
