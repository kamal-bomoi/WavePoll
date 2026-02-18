import { Text } from "@mantine/core";
import type { ComponentType } from "react";
import ReactCountdown, { type CountdownProps } from "react-countdown";
import { PollEndedAlert } from "./poll-ended-alert";

const Countdown = ReactCountdown as ComponentType<CountdownProps>;

export function PollTimeRemaining({
  time,
  on_complete
}: {
  time: string;
  on_complete: () => void;
}) {
  return (
    <Countdown
      date={time}
      onComplete={on_complete}
      onMount={({ completed }) => {
        if (completed) on_complete();
      }}
      renderer={({ hours, minutes, seconds, completed }) => {
        if (completed) return <PollEndedAlert />;

        return (
          <Text c="yellow" fs="italic" fz={16}>
            ends in {hours}:{minutes}:{seconds}
          </Text>
        );
      }}
    />
  );
}
