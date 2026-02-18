"use client";

import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export function NewPollButton() {
  const router = useRouter();

  return (
    <Button
      leftSection={<IconPlus />}
      color="dark"
      onClick={() => router.push("/")}
    >
      new poll
    </Button>
  );
}
