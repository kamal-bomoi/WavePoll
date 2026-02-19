import { Center, Loader, Stack } from "@mantine/core";

export default function Loading() {
  return (
    <Center className="wave-page">
      <Stack align="center" gap="sm">
        <Loader color="indigo" size="md" />
      </Stack>
    </Center>
  );
}
