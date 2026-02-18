import type { CreatePollPayload, Poll, VotePollPayload } from "@/types";
import { api } from "./client";

export type Mutation = typeof mutations;

export type MutationKey = keyof Mutation;

export type MutationResult<T extends MutationKey> = Awaited<
  ReturnType<Mutation[T]>
>;

export type MutationVariables<T extends MutationKey> = Parameters<
  Mutation[T]
>[0];

export const mutations = {
  "create poll": (payload: CreatePollPayload): Promise<Poll> =>
    api.post("/polls", payload),

  "vote poll": ({
    poll_id,
    body
  }: {
    poll_id: string;
    body: VotePollPayload;
  }): Promise<Poll> => api.patch(`/polls/${poll_id}`, body)
} as const satisfies Record<string, (...args: any[]) => Promise<any>>;
