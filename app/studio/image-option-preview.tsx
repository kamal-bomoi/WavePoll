import { Box, Image, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { env } from "@/env";

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
