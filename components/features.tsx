import { Card, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import {
  IconBolt,
  IconChartBar,
  IconEye,
  IconShare3
} from "@tabler/icons-react";

const features = [
  {
    title: "Create in seconds",
    description:
      "Single choice, rating, text, and image polls with draft/live publishing.",
    icon: IconBolt,
    color: "indigo"
  },
  {
    title: "Realtime participation",
    description:
      "Votes, reactions, and live presence update instantly across vote and result pages.",
    icon: IconEye,
    color: "teal"
  },
  {
    title: "Actionable results",
    description:
      "Shareable results, CSV export, and automatic ended-poll email summaries.",
    icon: IconChartBar,
    color: "orange"
  },
  {
    title: "Embeddable poll widget",
    description:
      "Embed voting and live results directly in your site with a lightweight script.",
    icon: IconShare3,
    color: "blue"
  }
] as const;

/**
 * Renders a responsive grid of feature cards, each showing an icon, bold title, and dimmed description.
 *
 * @returns A section element containing a responsive SimpleGrid (1 column on small screens, 2 on medium and up)
 *          with Card components for each entry in the `features` array.
 */
export function Features() {
  return (
    <section>
      <Stack gap="md">
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {features.map((feature) => (
            <Card key={feature.title} withBorder radius="lg" p="lg">
              <Stack gap="sm">
                <ThemeIcon
                  size={38}
                  radius="xl"
                  color={feature.color}
                  variant="light"
                >
                  <feature.icon size={18} />
                </ThemeIcon>
                <Text fw={700}>{feature.title}</Text>
                <Text size="sm" c="dimmed">
                  {feature.description}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </section>
  );
}
