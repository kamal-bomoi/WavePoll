import { Paper, Text, Title } from "@mantine/core";

interface Props {
  label: string;
  value: string | number;
}

/**
 * Renders a compact statistic card that displays a label above a prominent value.
 *
 * @param label - The descriptive text shown above the statistic
 * @param value - The value to display; may be a string or number
 * @returns The rendered statistic card element
 */
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
