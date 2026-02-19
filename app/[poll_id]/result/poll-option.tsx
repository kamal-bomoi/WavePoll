import { Group, Progress, Stack, Text } from "@mantine/core";
import type { Option } from "@/types";

interface PollOptionProps {
  option: Option;
  total: number;
}

const percentage = ({ total, votes }: { total: number; votes: number }) =>
  Math.round((votes / total) * 100) || 0;

export function PollOption({ option, total }: PollOptionProps) {
  const percent = percentage({ total, votes: option.votes });

  return (
    <Stack gap={6}>
      <Group justify="space-between" style={{ width: "100%" }} align="center">
        <Text fw={600}>{option.value}</Text>
        <Group align="center" gap={8}>
          <Text c="dimmed" size="sm">{`${percent}%`}</Text>
          <Text fw={700} size="sm">
            {option.votes} votes
          </Text>
        </Group>
      </Group>
      <Progress size="lg" color="indigo" value={percent} radius="xl" />
    </Stack>
  );
}
