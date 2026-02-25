import { Text } from "@mantine/core";
import ReactCountdown from "react-countdown";
import { PollEndedAlert } from "./poll-ended-alert";

export function PollTimeRemaining({
  time,
  on_complete
}: {
  time: Date;
  on_complete: () => void;
}) {
  return (
    <ReactCountdown
      date={time}
      onComplete={on_complete}
      renderer={({ days, hours, minutes, seconds, completed }) => {
        if (completed) return <PollEndedAlert />;

        return (
          <Text c="indigo.7" fs="italic" fz={14} fw={600}>
            Ends in {days}d {String(hours).padStart(2, "0")}h{" "}
            {String(minutes).padStart(2, "0")}m{" "}
            {String(seconds).padStart(2, "0")}s
          </Text>
        );
      }}
    />
  );
}
