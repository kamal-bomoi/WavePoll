import { Button, Group, Stack, Title } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { WavePollHeader } from "@/components/wavepoll-header";

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
      <Group justify="space-between" align="end" wrap="wrap" gap="sm">
        <Title order={1} style={{ maxWidth: 760 }}>
          Build premium polls
        </Title>
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
