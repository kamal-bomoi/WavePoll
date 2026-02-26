"use client";

import { Button, Group, Paper, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { LiveBehaviorSection } from "@/app/studio/live-behavior-section";
import type { StudioForm } from "@/app/studio/page";
import { PollSetupSection } from "@/app/studio/poll-setup-section";
import { WavePollHeader } from "@/app/studio/wavepoll-header";
import { WaveAlert } from "@/components/wave-alert";
import { useMutation } from "@/hooks/use-mutation";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import type { PollType } from "@/lib/db/schema";
import type { CreatePollPayload, Poll } from "@/types";
import { MAX_OPTIONS, MIN_OPTIONS } from "@/utils/constants";
import { is_poll_ended } from "@/utils/poll-generic";

export function EditPollView({
  poll,
  is_owner_view,
  initial_owner_email
}: {
  poll: Poll;
  is_owner_view: boolean;
  initial_owner_email: string | null;
}) {
  const IMAGE_OPTION_PLACEHOLDER = "__image_option__";
  const router = useRouter();
  const mutation = useMutation("update poll");
  const update_query = useUpdateQuery();
  const has_ended = is_poll_ended(poll);
  const [image_option_keys, set_image_option_keys] = useState<string[]>(
    poll.type === "image" ? poll.options.map((option) => option.value) : []
  );
  const [image_files, set_image_files] = useState<(File | null)[]>(
    poll.type === "image" ? poll.options.map(() => null) : []
  );
  const form = useForm<CreatePollPayload>({
    initialValues: {
      owner_email: initial_owner_email ?? "",
      title: poll.title,
      description: poll.description ?? "",
      type: poll.type,
      status: poll.status,
      end_at: new Date(poll.end_at).toISOString(),
      reaction_emojis: poll.reaction_emojis ?? null,
      options:
        poll.type === "single" || poll.type === "image"
          ? poll.type === "image"
            ? poll.options.map(() => IMAGE_OPTION_PLACEHOLDER)
            : poll.options.map((option) => option.value)
          : null
    },
    validate: {
      type: (value) => (value ? null : "Poll type is required."),
      title: (value) => {
        const trimmed = value.trim();

        if (!trimmed) return "Title is required.";

        if (trimmed.length < 3) return "Title must be at least 3 characters.";

        return null;
      },
      options: (value, values) => {
        if (values.type === "image") {
          const count = (value ?? []).reduce((acc, _entry, index) => {
            const has_existing_key =
              (image_option_keys[index] ?? "").trim().length > 0;
            const has_selected_file = !!image_files[index];

            return has_existing_key || has_selected_file ? acc + 1 : acc;
          }, 0);

          return count >= MIN_OPTIONS
            ? null
            : `Add at least ${MIN_OPTIONS} options.`;
        }

        if (values.type !== "single") return null;

        const count = (value ?? []).filter(
          (option) => option.trim().length > 0
        ).length;

        return count >= MIN_OPTIONS
          ? null
          : `Add at least ${MIN_OPTIONS} options.`;
      }
    }
  }) as StudioForm;

  function on_type_change(next_type: PollType) {
    const current_type = form.values.type;

    form.setFieldValue("type", next_type);

    if (next_type === "single") {
      const current =
        current_type === "single" ? (form.values.options ?? []) : [];

      form.setFieldValue(
        "options",
        current.length >= MIN_OPTIONS
          ? current
          : Array.from({ length: MIN_OPTIONS }, () => "")
      );

      set_image_files([]);

      return;
    }

    if (next_type === "image") {
      const count = Math.max(
        image_option_keys.length,
        form.values.options?.length ?? 0,
        MIN_OPTIONS
      );

      set_image_option_keys((previous) => {
        if (previous.length >= count) return previous;

        return [
          ...previous,
          ...Array.from({ length: count - previous.length }, () => "")
        ];
      });

      form.setFieldValue(
        "options",
        Array.from({ length: count }, () => IMAGE_OPTION_PLACEHOLDER)
      );

      set_image_files(Array.from({ length: count }, () => null));

      return;
    }

    form.setFieldValue("options", null);

    set_image_files([]);
  }

  const on_submit = form.onSubmit((values) => {
    if (!window.confirm("Are you sure you want to update this poll?")) return;

    const reaction_emojis =
      Array.isArray(values.reaction_emojis) && values.reaction_emojis.length > 0
        ? values.reaction_emojis
        : null;

    const image_options = image_option_keys.filter(
      (key) => key.trim().length > 0
    );
    const owner_email = values.owner_email?.trim() ?? "";

    mutation.mutate(
      {
        poll_id: poll.id,
        payload: {
          title: values.title,
          type: values.type,
          status: values.status,
          description: values.description || null,
          end_at: new Date(values.end_at).toISOString(),
          owner_email: owner_email.length > 0 ? owner_email : null,
          reaction_emojis,
          options:
            values.type === "single" || values.type === "image"
              ? values.type === "image"
                ? image_options
                : values.options
              : null,
          image_files
        }
      },
      {
        onSuccess(next_poll) {
          update_query<Poll>(queries.poll.key(next_poll.id), (draft) => {
            Object.assign(draft, next_poll);
          });

          update_query<Poll[]>(queries.polls.key(), (draft) => {
            const item = draft.find((item) => item.id === next_poll.id);

            if (item) Object.assign(item, next_poll);
          });

          toast.success("Poll updated.");
          router.push("/studio");
        }
      }
    );
  });

  if (!is_owner_view)
    return (
      <WaveAlert
        type="error"
        message="Only the poll owner can edit this draft."
      />
    );

  if (poll.status !== "draft" && !mutation.isSuccess)
    return (
      <WaveAlert type="warning" message="Only draft polls can be edited." />
    );

  if (has_ended)
    return (
      <WaveAlert
        type="warning"
        message="This poll has ended and can no longer be edited."
      />
    );

  return (
    <form onSubmit={on_submit}>
      <Stack gap="lg">
        <Paper p="md">
          <Stack gap="sm">
            <WavePollHeader title="Edit draft" />
            <Group justify="space-between" gap="sm" wrap="wrap">
              <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button
                type="submit"
                leftSection={<IconDeviceFloppy size={16} />}
                loading={mutation.isPending}
              >
                Save
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper>
          <PollSetupSection
            form={form}
            on_type_change={on_type_change}
            image_files={image_files}
            image_option_keys={image_option_keys}
            show_owner_email
            show_status
            on_add_image_option={() => {
              if ((form.values.options?.length ?? 0) >= MAX_OPTIONS) return;

              form.insertListItem("options", IMAGE_OPTION_PLACEHOLDER);
              set_image_files((previous) => [...previous, null]);
              set_image_option_keys((previous) => [...previous, ""]);
            }}
            on_remove_image_option={(index) => {
              form.removeListItem("options", index);
              set_image_files((previous) =>
                previous.filter((_, i) => i !== index)
              );
              set_image_option_keys((previous) =>
                previous.filter((_, i) => i !== index)
              );
            }}
            on_change_image_file={(index, file) => {
              set_image_files((previous) => {
                const next = [...previous];
                next[index] = file;
                return next;
              });

              if (!file) return;

              set_image_option_keys((previous) => {
                const next = [...previous];

                if (!next[index]) next[index] = "";

                return next;
              });
            }}
          />
        </Paper>

        <Paper>
          <LiveBehaviorSection form={form} />
        </Paper>
      </Stack>
    </form>
  );
}
