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

/**
 * Renders a poll option showing label or image, vote count, and a percentage progress bar.
 *
 * @param option - Poll option object containing `value` and `votes`.
 * @param total - Total number of votes across all options; used to compute the displayed percentage.
 * @param is_image - If true, displays the option as an image (sourced from the configured S3 URL); otherwise displays the option text.
 * @returns The React element representing the poll option row with percentage and progress bar.
 */
export function PollOption({
  option,
  total,
  is_image = false
}: PollOptionProps) {
  const percent = percentage({ total, votes: option.votes });

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
      <Group
        justify={is_image ? "flex-start" : "space-between"}
        style={{ width: "100%" }}
        align="center"
      >
        {!is_image && <Text fw={600}>{option.value}</Text>}
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
