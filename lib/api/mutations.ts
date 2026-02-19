import type { CreatePollPayload, Poll, VotePayload } from "@/types";
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

  vote: ({
    poll_id,
    payload
  }: {
    poll_id: string;
    payload: VotePayload;
  }): Promise<Poll> => api.post(`/polls/${poll_id}/votes`, payload)
} as const satisfies Record<string, (...args: any[]) => Promise<any>>;
