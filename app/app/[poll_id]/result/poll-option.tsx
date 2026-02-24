import { Group, Image, Progress, Stack, Text } from "@mantine/core";
import Zoom from "react-medium-image-zoom";
import { env } from "@/env";
import type { Option } from "@/types";

interface PollOptionProps {
  option: Option;
  total: number;
  is_image?: boolean;
}

const percentage = ({ total, votes }: { total: number; votes: number }) =>
  total === 0 ? 0 : Math.round((votes / total) * 100);

export function PollOption({
  option,
  total,
  is_image = false
}: PollOptionProps) {
  const percent = percentage({ total, votes: option.votes });
  const label = is_image ? "Image option" : option.value;

  return (
    <Stack gap={6}>
      {is_image && (
        <Zoom>
          <Image
            src={`${env.NEXT_PUBLIC_S3_URL}/${option.value}`}
            alt="Poll option"
            radius="md"
            h={180}
            fit="cover"
          />
        </Zoom>
      )}
      <Group justify="space-between" style={{ width: "100%" }} align="center">
        <Text fw={600}>{label}</Text>
        <Group align="center" gap={8}>
          <Text c="dimmed" size="sm">{`${percent}%`}</Text>
          <Text fw={700} size="sm">
            {option.votes} {option.votes === 1 ? "vote" : "votes"}
          </Text>
        </Group>
      </Group>
      <Progress size="lg" color="indigo" value={percent} radius="xl" />
    </Stack>
  );
}
