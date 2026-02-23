"use client";

import { Container, Paper, SimpleGrid, Stack } from "@mantine/core";
import { type UseFormReturnType, useForm } from "@mantine/form";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HistoryPollsSection } from "@/app/app/history-polls-section";
import { LiveBehaviorSection } from "@/app/app/live-behavior-section";
import { PollSetupSection } from "@/app/app/poll-setup-section";
import { StudioHeader } from "@/app/app/studio-header";
import { UserPollsSection } from "@/app/app/user-polls-section";
import { useLocalPollIds } from "@/hooks/use-local-poll-ids";
import { useMutation } from "@/hooks/use-mutation";
import { useUpdateQuery } from "@/hooks/use-update-query";
import { queries } from "@/lib/api/queries";
import type { CreatePollPayload, Poll } from "@/types";

export type StudioForm = UseFormReturnType<CreatePollPayload>;

export default function StudioPage() {
  const router = useRouter();
  const [, set_poll_ids] = useLocalPollIds();
  const mutation = useMutation("create poll");
  const update_query = useUpdateQuery();
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
      title: (value) => {
        const trimmed = value.trim();

        if (!trimmed) return "Title is required.";

        if (trimmed.length < 3) return "Title must be at least 3 characters.";

        return null;
      },
      options: (value, values) => {
        if (values.type !== "single") return null;

        const count = (value ?? []).filter(
          (option) => option.trim().length > 0
        ).length;

        return count >= 2
          ? null
          : "Add at least 2 options for single-choice polls.";
      }
    }
  });

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
        options: values.type === "single" ? values.options : null
      },
      {
        onSuccess(poll) {
          set_poll_ids((previous) => {
            const next_ids = [
              poll.id,
              ...(previous ?? []).filter((id) => id !== poll.id)
            ];

            return next_ids.slice(0, 100);
          });

          update_query<Poll[]>(queries.polls.key(), (draft) => {
            draft.unshift(poll);
          });

          form.reset();

          toast.success(
            poll.status === "live"
              ? "Poll published live."
              : "Draft saved successfully."
          );

          if (poll.status === "live") router.push(`/app/${poll.id}`);
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
                <PollSetupSection form={form} />
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
