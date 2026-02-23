"use client";

import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function NewPollButton() {
  const router = useRouter();

  return (
    <Button
      leftSection={<IconPlus size={16} />}
      color="indigo"
      variant="light"
      onClick={() => router.push("/app")}
    >
      New Poll
    </Button>
  );
}
