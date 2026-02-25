import { noop } from "@tanstack/react-query";
import type { CreatePollPayload, Poll, UploadUrl, VotePayload } from "@/types";
import { upload } from "@/utils/upload";
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
  "create poll": async (
    payload: CreatePollPayload & { image_files?: (File | null)[] }
  ): Promise<Poll> => {
    const { image_files, ...poll_payload } = payload;

    if (poll_payload.type !== "image") return api.post("/polls", poll_payload);

    const { keys } = await upload({
      files: (image_files ?? []).filter((file): file is File => !!file),
      prepare: (files_info) =>
        api.post<UploadUrl[]>("/polls/upload-urls", { files: files_info }),
      cleanup: (keys) => api.delete("/polls/images", { data: { keys } })
    });

    try {
      return await api.post("/polls", {
        ...poll_payload,
        options: keys
      } satisfies CreatePollPayload);
    } catch (e) {
      await api.delete("/polls/images", { data: { keys } }).catch(noop);

      throw e;
    }
  },

  "publish poll": ({ poll_id }: { poll_id: string }): Promise<Poll> =>
    api.patch(`/polls/${poll_id}`, { status: "live" }),

  "unpublish poll": ({ poll_id }: { poll_id: string }): Promise<Poll> =>
    api.patch(`/polls/${poll_id}`, { status: "draft" }),

  "delete poll": ({ poll_id }: { poll_id: string }): Promise<undefined> =>
    api.delete(`/polls/${poll_id}`, { data: {} }),

  vote: ({
    poll_id,
    payload
  }: {
    poll_id: string;
    payload: VotePayload;
  }): Promise<Poll> => api.post(`/polls/${poll_id}/votes`, payload)
} as const satisfies Record<string, (...args: any[]) => Promise<any>>;
