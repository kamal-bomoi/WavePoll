import { Button, Group, Stack } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { WavePollHeader } from "@/app/studio/wavepoll-header";

/**
 * Studio page header that displays the WavePollHeader and a right-aligned submit button.
 *
 * @param can_submit - Whether submission is currently allowed; when `false` the submit button is disabled.
 * @param creating - Whether a submit action is in progress; when `true` the button shows a loading state and is disabled.
 * @param status - Controls the submit button label: `"live"` shows "Publish live", `"draft"` shows "Save draft".
 * @returns A header element containing WavePollHeader and a submit Button whose disabled, loading state, and label reflect the provided props.
 */
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
