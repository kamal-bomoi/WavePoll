import type { CreatePollPayload, Poll, UploadUrl, VotePayload } from "@/types";
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

    const files = (image_files ?? []).filter((file): file is File => !!file);

    const signed = await api.post<UploadUrl[]>("/polls/upload-urls", {
      files: files.map((file) => ({
        content_type: file.type,
        content_length: file.size
      }))
    });

    if (signed.length !== files.length)
      throw new Error("Failed to prepare image uploads.");

    await Promise.all(
      signed.map(async ({ url }, index) => {
        const file = files[index];

        if (!file) throw new Error("Image file is missing.");

        const response = await fetch(url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type
          }
        });

        if (!response.ok) throw new Error("File upload failed.");
      })
    );

    return api.post("/polls", {
      ...poll_payload,
      options: signed.map((entry) => entry.key)
    } satisfies CreatePollPayload);
  },

  "publish poll": ({ poll_id }: { poll_id: string }): Promise<Poll> =>
    api.patch(`/polls/${poll_id}`, { status: "live" }),

  "unpublish poll": ({ poll_id }: { poll_id: string }): Promise<Poll> =>
    api.patch(`/polls/${poll_id}`, { status: "draft" }),

  "delete poll": ({ poll_id }: { poll_id: string }): Promise<undefined> =>
    api.delete(`/polls/${poll_id}`),

  vote: ({
    poll_id,
    payload
  }: {
    poll_id: string;
    payload: VotePayload;
  }): Promise<Poll> => api.post(`/polls/${poll_id}/votes`, payload)
} as const satisfies Record<string, (...args: any[]) => Promise<any>>;
