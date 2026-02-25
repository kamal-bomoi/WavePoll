import {
  ActionIcon,
  Card,
  FileInput,
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
import type { StudioForm } from "@/app/studio/page";
import type { PollStatus, PollType } from "@/lib/db/schema";
import { MAX_OPTIONS } from "@/utils/constants";

const poll_type_options: { label: string; value: PollType }[] = [
  { label: "Single", value: "single" },
  { label: "Image", value: "image" },
  { label: "Rating", value: "rating" },
  { label: "Text", value: "text" }
];

export const poll_status_options: {
  label: string;
  value: PollStatus;
}[] = [
  { label: "Draft", value: "draft" },
  { label: "Live", value: "live" }
];

export function PollSetupSection({
  form,
  on_type_change,
  image_files,
  on_change_image_file,
  on_add_image_option,
  on_remove_image_option
}: {
  form: StudioForm;
  on_type_change: (next_type: PollType) => void;
  image_files: (File | null)[];
  on_change_image_file: (index: number, file: File | null) => void;
  on_add_image_option: () => void;
  on_remove_image_option: (index: number) => void;
}) {
  const can_add_option = (form.values.options?.length ?? 0) < MAX_OPTIONS;

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
        value={form.values.type}
        onChange={(value) => on_type_change(value as PollType)}
      />
      <Select
        label="Status"
        required
        data={poll_status_options}
        {...form.getInputProps("status")}
      />

      {(form.values.type === "single" || form.values.type === "image") && (
        <Stack gap={10}>
          <Group justify="space-between">
            <Text fw={600} size="sm">
              {form.values.type === "image" ? "Image options" : "Options"}
            </Text>
            <ActionIcon
              variant="light"
              color="indigo"
              disabled={!can_add_option}
              onClick={
                form.values.type === "image"
                  ? on_add_image_option
                  : () => {
                      if (!can_add_option) return;

                      form.insertListItem("options", "");
                    }
              }
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
          {form.values.options?.map((_, index) => (
            <Group key={`option-${index}`} wrap="nowrap" align="end">
              {form.values.type === "image" ? (
                <FileInput
                  style={{ flex: 1 }}
                  accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                  placeholder={`Upload image ${index + 1}`}
                  value={image_files[index] ?? null}
                  onChange={(file) => on_change_image_file(index, file)}
                />
              ) : (
                <TextInput
                  style={{ flex: 1 }}
                  placeholder={`Option ${index + 1}`}
                  {...form.getInputProps(`options.${index}`)}
                />
              )}
              <ActionIcon
                variant="subtle"
                color="red"
                disabled={form.values.options!.length < 3}
                onClick={
                  form.values.type === "image"
                    ? () => on_remove_image_option(index)
                    : () => form.removeListItem("options", index)
                }
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
