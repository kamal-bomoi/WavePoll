import { Box, Image, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { env } from "@/env";

/**
 * Render an image preview from a local File or a fallback S3 key, or show a dashed placeholder when no source is available.
 *
 * Creates a temporary object URL for `file` while it is provided and revokes it on cleanup. If `file` is not present,
 * the component uses `image_key` to build a remote URL from the configured S3 base URL. When neither source exists,
 * a placeholder box with "No image selected" is rendered.
 *
 * @param file - Local File to preview; when provided a temporary object URL will be used
 * @param image_key - Optional S3 object key used to construct a fallback remote image URL
 * @param alt - Alternative text for the rendered image
 * @returns The rendered preview element: an Image when a source exists, otherwise a placeholder Box
 */
export function ImageOptionPreview({
  file,
  image_key,
  alt
}: {
  file: File | null;
  image_key?: string;
  alt: string;
}) {
  const [preview_url, set_preview_url] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      set_preview_url(null);
      return;
    }

    const next_preview_url = URL.createObjectURL(file);
    set_preview_url(next_preview_url);

    return () => URL.revokeObjectURL(next_preview_url);
  }, [file]);

  const src =
    preview_url ??
    (image_key ? `${env.NEXT_PUBLIC_S3_URL}/${image_key}` : null);

  if (!src)
    return (
      <Box
        style={{
          height: 180,
          borderRadius: 8,
          border: "1px dashed var(--mantine-color-gray-4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text size="sm" c="dimmed">
          No image selected
        </Text>
      </Box>
    );

  return <Image src={src} alt={alt} radius="md" h={180} fit="cover" />;
}
