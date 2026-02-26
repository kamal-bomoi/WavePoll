import type { UploadUrl, UploadUrlsPayload } from "@/types";

/**
 * Uploads files using signed URLs obtained from the provided prepare callback and returns their keys.
 *
 * @param files - Files to be uploaded.
 * @param prepare - Receives an array of `{ content_type, content_length }` descriptors and returns an array of signed upload entries containing `url` and `key`.
 * @param cleanup - Called with keys of successfully uploaded files if a partial failure occurs, allowing caller to remove those uploads.
 * @returns An object with `keys`: the upload keys corresponding to each uploaded file.
 * @throws Error if preparing uploads fails, if an expected file is missing, or if one or more uploads fail.
 */
export async function upload({
  files,
  prepare,
  cleanup
}: {
  files: File[];
  prepare: (files: UploadUrlsPayload["files"]) => Promise<UploadUrl[]>;
  cleanup: (keys: string[]) => Promise<void>;
}): Promise<{ keys: string[] }> {
  if (!files.length) return { keys: [] };

  const signed = await prepare(
    files.map((file) => ({
      content_type: file.type,
      content_length: file.size
    }))
  );

  if (signed.length !== files.length)
    throw new Error("Failed to prepare image uploads.");

  const controller = new AbortController();

  const results = await Promise.allSettled(
    signed.map(async ({ url, key }, index) => {
      const file = files[index];

      if (!file) throw new Error("Image file is missing.");

      const res = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
        signal: controller.signal
      });

      if (!res.ok) {
        controller.abort();
        throw new Error(
          `File upload failed (image ${index + 1} of ${files.length}).`
        );
      }

      return key;
    })
  );

  const succeeded = results
    .filter(
      (r): r is PromiseFulfilledResult<string> => r.status === "fulfilled"
    )
    .map((r) => r.value);

  const failed = results.some((r) => r.status === "rejected");

  if (failed) {
    if (succeeded.length) await cleanup(succeeded).catch(() => {});

    throw new Error("One or more images failed to upload. Please try again.");
  }

  return { keys: signed.map((s) => s.key) };
}
