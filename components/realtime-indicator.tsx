import { Badge, Group, ThemeIcon } from "@mantine/core";
import { IconBolt } from "@tabler/icons-react";

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
