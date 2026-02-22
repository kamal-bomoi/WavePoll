import {
  ActionIcon,
  Card,
  Group,
  SegmentedControl,
  Select,
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import {
  IconMail,
  IconMessage,
  IconPlus,
  IconTrash
} from "@tabler/icons-react";
import dayjs from "dayjs";
import type { StudioForm } from "@/app/page";
import type { PollType } from "@/types";

const poll_type_options: { label: string; value: PollType }[] = [
  { label: "Single", value: "single" },
  { label: "Rating", value: "rating" },
  { label: "Text", value: "text" }
];

export const poll_status_options: {
  label: string;
  value: "draft" | "live";
}[] = [
  { label: "Draft", value: "draft" },
  { label: "Live", value: "live" }
];

export function PollSetupSection({ form }: { form: StudioForm }) {
  return (
    <Stack gap="md">
      <Title order={3}>Poll setup</Title>
      <TextInput label="Title" required {...form.getInputProps("title")} />
      <Textarea
        label="Description"
        minRows={3}
        maxRows={6}
        {...form.getInputProps("description")}
      />
      <TextInput
        label="Notification email (optional)"
        placeholder="you@example.com"
        type="email"
        leftSection={<IconMail size={16} />}
        {...form.getInputProps("owner_email")}
      />
      <Text size="xs" c="dimmed" mt={-6}>
        If provided, we will send a summary email when this poll ends.
      </Text>
      <SegmentedControl
        fullWidth
        data={poll_type_options}
        {...form.getInputProps("type")}
      />
      <Select
        label="Status"
        data={poll_status_options}
        {...form.getInputProps("status")}
      />

      {form.values.type === "single" && (
        <Stack gap={10}>
          <Group justify="space-between">
            <Text fw={600} size="sm">
              Options
            </Text>
            <ActionIcon
              variant="light"
              color="indigo"
              onClick={() => form.insertListItem("options", "")}
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
          {form.values.options?.map((value, index) => (
            <Group key={`option-${value}-${index}`} wrap="nowrap" align="end">
              <TextInput
                style={{ flex: 1 }}
                placeholder={`Option ${index + 1}`}
                {...form.getInputProps(`options.${index}`)}
              />
              <ActionIcon
                variant="subtle"
                color="red"
                disabled={form.values.options!.length < 3}
                onClick={() => form.removeListItem("options", index)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          {!!form.errors.options && (
            <Text c="red" size="sm">
              {form.errors.options}
            </Text>
          )}
        </Stack>
      )}

      {form.values.type === "rating" && (
        <Slider
          min={1}
          max={5}
          step={1}
          value={5}
          marks={[1, 2, 3, 4, 5].map((value) => ({ value, label: `${value}` }))}
          mb="md"
        />
      )}

      {form.values.type === "text" && (
        <Card withBorder radius="md" bg="gray.0">
          <Group>
            <IconMessage size={16} />
            <Text size="sm">Audience can submit one short comment each.</Text>
          </Group>
        </Card>
      )}

      <Text fw={600} size="sm">
        Schedule
      </Text>
      <DateTimePicker
        label="End time"
        required
        valueFormat="MMM D, YYYY h:mm A"
        minDate={new Date()}
        maxDate={dayjs().add(1, "week").toDate()}
        {...form.getInputProps("end_at")}
      />
    </Stack>
  );
}
