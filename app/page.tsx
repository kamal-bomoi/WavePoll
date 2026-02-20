"use client";

import { Container, Paper, SimpleGrid, Stack } from "@mantine/core";
import { type UseFormReturnType, useForm } from "@mantine/form";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmbeddingSection } from "@/app/embedding-section";
import { LiveBehaviorSection } from "@/app/live-behavior-section";
import { PollSetupSection } from "@/app/poll-setup-section";
import { StudioHeader } from "@/app/studio-header";
import { UserPollsSection } from "@/app/user-polls-section";
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
      reaction_emojis: undefined
    },
    validate: {
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
        : undefined;

    mutation.mutate(
      {
        title: values.title,
        type: values.type,
        status: values.status,
        description: values.description || undefined,
        end_at: to_iso(values.end_at),
        owner_email: values.owner_email || undefined,
        reaction_emojis,
        options: values.type === "single" ? values.options : undefined
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

          if (poll.status === "live") router.push(`/${poll.id}`);
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
              can_submit={
                !!form.values.title.trim() &&
                (form.values.type !== "single" ||
                  (form.values.options ?? []).filter(
                    (option) => option.trim().length > 0
                  ).length >= 2)
              }
              creating={mutation.isPending}
              status={form.values.status}
            />

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
              <Paper>
                <PollSetupSection form={form} />
              </Paper>

              <Paper>
                <Stack gap="md">
                  <LiveBehaviorSection form={form} />

                  <EmbeddingSection />

                  <UserPollsSection />
                </Stack>
              </Paper>
            </SimpleGrid>
          </Stack>
        </form>
      </Container>
    </div>
  );
}

function to_iso(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  return new Date(value).toISOString();
}
