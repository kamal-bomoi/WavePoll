import { Center, Loader } from "@mantine/core";

/**
 * Renders a centered indigo loading indicator.
 *
 * @returns A JSX element containing a Mantine Center that wraps a Loader with color `"indigo"` and size `"md"`.
 */
export default function Loading() {
  return (
    <Center className="wave-page">
      <Loader color="indigo" size="md" />
    </Center>
  );
}
