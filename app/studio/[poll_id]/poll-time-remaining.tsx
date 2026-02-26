import { Text } from "@mantine/core";
import ReactCountdown from "react-countdown";
import { PollEndedAlert } from "./poll-ended-alert";

/**
 * Displays a countdown to a target end time and shows a PollEndedAlert when it completes.
 *
 * @param time - The target end time for the countdown.
 * @param on_complete - Callback invoked when the countdown reaches zero.
 * @returns The countdown element that displays remaining days, hours, minutes, and seconds, or a PollEndedAlert when completed.
 */
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
