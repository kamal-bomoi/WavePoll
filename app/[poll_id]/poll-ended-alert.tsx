import { WaveAlert } from "@/components/wave-alert";

export function PollEndedAlert() {
  return (
    <WaveAlert
      type="warning"
      message="This poll has ended. Voting is locked."
    />
  );
}
