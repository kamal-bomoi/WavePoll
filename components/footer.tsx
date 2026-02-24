import { Button, Group, Text } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";

export function Footer() {
  return (
    <footer className="wave-footer">
      <Group justify="space-between" wrap="wrap">
        <Text size="sm" c="dimmed">
          WavePoll
        </Text>
        <Button
          component="a"
          href="https://github.com/kamalyusuf/WavePoll"
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
