"use client";

import { Container, Paper, SimpleGrid, Stack } from "@mantine/core";
import { type UseFormReturnType, useForm } from "@mantine/form";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { HistoryPollsSection } from "@/app/studio/history-polls-section";
import { LiveBehaviorSection } from "@/app/studio/live-behavior-section";
import { PollSetupSection } from "@/app/studio/poll-setup-section";
import { StudioHeader } from "@/app/studio/studio-header";
import { UserPollsSection } from "@/app/studio/user-polls-section";
import { useMutation } from "@/hooks/use-mutation";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import type { PollType } from "@/lib/db/schema";
import type { CreatePollPayload, Poll } from "@/types";
import { MAX_OPTIONS, MIN_OPTIONS } from "@/utils/constants";

export type StudioForm = UseFormReturnType<CreatePollPayload>;

export default function StudioPage() {
  const router = useRouter();
  const mutation = useMutation("create poll");
  const update_query = useUpdateQuery();
  const [image_files, set_image_files] = useState<(File | null)[]>([
    null,
    null
  ]);
  const form = useForm<CreatePollPayload>({
    initialValues: {
      owner_email: "",
      title: "",
      description: "",
      type: "single",
      status: "live",
      options: ["", ""],
      end_at: dayjs().add(2, "hour").toDate().toISOString(),
      reaction_emojis: null
    },
    validate: {
      options: (value, values) => {
        if (values.type !== "single" && values.type !== "image") return null;

        const count = (value ?? []).filter(
          (option) => option.trim().length > 0
        ).length;

        return count >= 2 ? null : `Add at least ${MIN_OPTIONS} options.`;
      }
    }
  });

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

      set_image_files([null, null]);

      return;
    }

    if (next_type !== "image") {
      form.setFieldValue("options", null);
      set_image_files([null, null]);

      return;
    }

    if ((form.values.options?.length ?? 0) < MIN_OPTIONS)
      form.setFieldValue(
        "options",
        Array.from({ length: MIN_OPTIONS }, () => "")
      );

    set_image_files((previous) => {
      const next = [...previous];
      while (next.length < MIN_OPTIONS) next.push(null);
      return next.slice(0, MAX_OPTIONS);
    });
  }

  const on_submit = form.onSubmit(async (values) => {
    const reaction_emojis =
      Array.isArray(values.reaction_emojis) && values.reaction_emojis.length > 0
        ? values.reaction_emojis
        : null;

    mutation.mutate(
      {
        title: values.title,
        type: values.type,
        status: values.status,
        description: values.description || null,
        end_at: to_iso(values.end_at),
        owner_email: values.owner_email || null,
        reaction_emojis,
        options: values.type === "single" ? values.options : null,
        image_files
      },
      {
        onSuccess(poll) {
          update_query<Poll[]>(queries.polls.key(), (draft) => {
            draft.unshift(poll);
          });

          form.reset();

          toast.success(
            poll.status === "live"
              ? "Poll published live."
              : "Draft saved successfully."
          );

          set_image_files([null, null]);

          if (poll.status === "live") router.push(`/studio/${poll.id}`);
        }
      }
    );
  });

  return (
    <div className="wave-page">
      <Container size="lg">
        <form onSubmit={on_submit}>
          <Stack gap="lg" className="wave-slide-up">
            <StudioHeader
              creating={mutation.isPending}
              status={form.values.status}
              can_submit
            />

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Paper>
                <PollSetupSection
                  form={form}
                  on_type_change={on_type_change}
                  image_files={image_files}
                  on_add_image_option={() => {
                    if ((form.values.options?.length ?? 0) >= MAX_OPTIONS)
                      return;

                    form.insertListItem("options", "");
                    set_image_files((previous) => [...previous, null]);
                  }}
                  on_remove_image_option={(index) => {
                    form.removeListItem("options", index);
                    set_image_files((previous) =>
                      previous.filter((_, i) => i !== index)
                    );
                  }}
                  on_change_image_file={(index, file) => {
                    form.setFieldValue(
                      `options.${index}`,
                      file ? `__pending_image_${index}` : ""
                    );

                    set_image_files((previous) => {
                      const next = [...previous];
                      next[index] = file;

                      return next;
                    });
                  }}
                />
              </Paper>

              <Paper>
                <Stack gap="md">
                  <LiveBehaviorSection form={form} />
                  <UserPollsSection />
                  <HistoryPollsSection />
                </Stack>
              </Paper>
            </SimpleGrid>
          </Stack>
        </form>
      </Container>
    </div>
  );
}

function to_iso(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime()))
    throw new Error(`Invalid date value: ${value}`);

  return date.toISOString();
}
