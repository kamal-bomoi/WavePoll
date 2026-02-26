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

type PollMutationPayload = Omit<CreatePollPayload, "owner_email"> & {
  owner_email?: string | null;
  image_files?: (File | null)[];
};

export const mutations = {
  "create poll": async (payload: PollMutationPayload): Promise<Poll> => {
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
      });
    } catch (e) {
      await api.delete("/polls/images", { data: { keys } }).catch(noop);

      throw e;
    }
  },

  "update poll": async ({
    poll_id,
    payload
  }: {
    poll_id: string;
    payload: PollMutationPayload;
  }): Promise<Poll> => {
    const { image_files, ...poll_payload } = payload;

    if (poll_payload.type !== "image")
      return api.put(`/polls/${poll_id}`, {
        ...poll_payload,
        owner_email: poll_payload.owner_email || undefined
      });

    const files = image_files ?? [];

    const options = [...(poll_payload.options ?? [])];

    const selected_indices = files
      .map((file, index) => ({ file, index }))
      .filter((entry): entry is { file: File; index: number } => !!entry.file);

    if (!selected_indices.length)
      return api.put(`/polls/${poll_id}`, {
        ...poll_payload,
        options,
        owner_email: poll_payload.owner_email || undefined
      });

    const { keys } = await upload({
      files: selected_indices.map((entry) => entry.file),
      prepare: (files_info) =>
        api.post<UploadUrl[]>("/polls/upload-urls", { files: files_info }),
      cleanup: (keys) => api.delete("/polls/images", { data: { keys } })
    });

    selected_indices.forEach((entry, i) => {
      options[entry.index] = keys[i] ?? options[entry.index] ?? "";
    });

    try {
      return await api.put(`/polls/${poll_id}`, {
        ...poll_payload,
        options,
        owner_email: poll_payload.owner_email || undefined
      });
    } catch (e) {
      await api.delete("/polls/images", { data: { keys } }).catch(noop);

      throw e;
    }
  },

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
