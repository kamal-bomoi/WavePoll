import { Button, Group, Stack } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { WavePollHeader } from "@/app/studio/wavepoll-header";

export function StudioHeader({
  can_submit,
  creating,
  status
}: {
  can_submit: boolean;
  creating: boolean;
  status: "draft" | "live";
}) {
  return (
    <Stack gap="sm">
      <WavePollHeader />
      <Group justify="flex-end" align="end" wrap="wrap" gap="sm">
        <Button
          type="submit"
          leftSection={<IconDeviceFloppy size={16} />}
          disabled={!can_submit || creating}
          loading={creating}
        >
          {status === "live" ? "Publish live" : "Save draft"}
        </Button>
      </Group>
    </Stack>
  );
}
