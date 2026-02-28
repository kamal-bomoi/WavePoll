import { Paper, Text, Title } from "@mantine/core";

interface Props {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: Props) {
  return (
    <Paper withBorder radius="md" p="md">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Title order={3}>{value}</Title>
    </Paper>
  );
}
