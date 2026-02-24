import type { UploadUrl, UploadUrlsPayload } from "@/types";

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
