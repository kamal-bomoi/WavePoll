import { Button, Group, Text } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";

/**
 * Renders the site footer showing the "WavePoll" label and a GitHub button linking to the project repository.
 *
 * @returns The JSX element representing the footer containing the brand text and a GitHub link button (opens in a new tab).
 */
export function Footer() {
  return (
    <footer className="wave-footer">
      <Group justify="space-between" wrap="wrap">
        <Text size="sm" c="dimmed">
          WavePoll
        </Text>
        <Button
          component="a"
          href="https://github.com/kamal-bomoi/WavePoll"
          target="_blank"
          rel="noreferrer"
          variant="subtle"
          color="indigo"
          leftSection={<IconBrandGithub size={16} />}
        >
          GitHub
        </Button>
      </Group>
    </footer>
  );
}
