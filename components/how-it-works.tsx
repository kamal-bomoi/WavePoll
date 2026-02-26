import {
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title
} from "@mantine/core";
import {
  IconClockHour4,
  IconDeviceDesktopAnalytics,
  IconPlayerPlayFilled,
  IconShare3
} from "@tabler/icons-react";

const steps = [
  {
    title: "Create",
    description: "Set title, type, options, end time, and optional reactions.",
    icon: IconPlayerPlayFilled
  },
  {
    title: "Share",
    description: "Share the poll URL or embed it on your site.",
    icon: IconShare3
  },
  {
    title: "Track",
    description: "Watch live votes and audience presence as responses come in.",
    icon: IconDeviceDesktopAnalytics
  },
  {
    title: "Close + Export",
    description: "When ended, export CSV and receive summary email (optional).",
    icon: IconClockHour4
  }
] as const;

/**
 * Renders the "How It Works" section with four steps, each showing an icon, bold title, and description in a responsive grid.
 *
 * @returns A JSX element containing the "How It Works" section.
 */
export function HowItWorks() {
  return (
    <section id="how-it-works">
      <Paper withBorder radius="lg" p="lg">
        <Stack gap="md">
          <Title order={2}>How It Works</Title>
          <Divider />
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            {steps.map((step) => (
              <Stack key={step.title} gap={8}>
                <Group gap={8} wrap="nowrap">
                  <ThemeIcon size="sm" color="indigo" variant="light">
                    <step.icon size={12} />
                  </ThemeIcon>
                  <Text fw={700} size="sm">
                    {step.title}
                  </Text>
                </Group>
                <Text size="sm" c="dimmed">
                  {step.description}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Stack>
      </Paper>
    </section>
  );
}
