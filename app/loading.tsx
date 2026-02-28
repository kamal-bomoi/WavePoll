import { Center, Loader } from "@mantine/core";

export default function Loading() {
  return (
    <Center className="wave-page">
      <Loader color="indigo" size="md" />
    </Center>
  );
}
