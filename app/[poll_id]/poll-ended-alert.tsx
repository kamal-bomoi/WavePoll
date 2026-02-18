import { Alert, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export function PollEndedAlert() {
  return (
    <Alert icon={<IconAlertCircle strokeWidth={2} />} color="orange" variant="light">
      <Text c="orange.8" fz={14} fw={600}>
        This poll has ended. Voting is locked.
      </Text>
    </Alert>
  );
}
