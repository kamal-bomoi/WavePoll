import { Badge, Group, ThemeIcon } from "@mantine/core";
import { IconBolt } from "@tabler/icons-react";

/**
 * Renders a compact "Live updates" indicator composed of a teal bolt icon and badge.
 *
 * @returns A JSX element containing a non-wrapping horizontal Group with a teal ThemeIcon (bolt) and a "Live updates" Badge.
 */
export function RealtimeIndicator() {
  return (
    <Group gap={6} wrap="nowrap">
      <ThemeIcon size="sm" variant="light" color="teal">
        <IconBolt size={12} />
      </ThemeIcon>
      <Badge size="sm" color="teal" variant="light">
        Live updates
      </Badge>
    </Group>
  );
}
