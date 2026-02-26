import { WaveAlert } from "@/components/wave-alert";

/**
 * Render a warning alert indicating the poll has ended and voting is locked.
 *
 * @returns A JSX element that displays a warning WaveAlert with the message "This poll has ended. Voting is locked."
 */
export function PollEndedAlert() {
  return (
    <WaveAlert
      type="warning"
      title=""
      message="This poll has ended. Voting is locked."
    />
  );
}
