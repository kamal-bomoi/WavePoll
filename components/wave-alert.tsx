import { Alert, Stack, Text } from "@mantine/core";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle
} from "@tabler/icons-react";
import axios from "axios";
import type { ReactNode } from "react";
import type { ApiError } from "@/types";
import { parse_api_error } from "@/utils/error";

type WaveAlertType = "info" | "success" | "warning" | "error";

type MessageInput = string | string[] | ApiError | Error;

const TypeProps: Record<
  WaveAlertType,
  { color: string; icon: ReactNode; title: string }
> = {
  success: {
    color: "teal",
    title: "Success",
    icon: <IconCircleCheck size={24} />
  },
  warning: {
    color: "orange",
    title: "Warning",
    icon: <IconAlertTriangle size={24} />
  },
  error: { color: "red", title: "Error", icon: <IconAlertCircle size={24} /> },
  info: { color: "indigo", title: "Info", icon: <IconInfoCircle size={24} /> }
};

export function WaveAlert({
  message,
  type,
  title
}: {
  type: WaveAlertType;
  message: MessageInput;
  title?: string;
}) {
  const messages = normalize_messages(message);

  if (!messages.length) return null;

  const props = TypeProps[type];

  return (
    <Alert
      title={title ?? props.title}
      color={props.color}
      icon={props.icon}
      variant="light"
      radius="md"
    >
      {messages.length === 1 ? (
        <Text size="sm">{messages[0]}</Text>
      ) : (
        <Stack gap={6}>
          {messages.map((entry, index) => (
            <Text
              key={`${entry}-${index}`}
              size="sm"
              style={{
                paddingLeft: 10,
                borderLeft: `2px solid var(--mantine-color-${props.color}-4)`
              }}
            >
              {entry}
            </Text>
          ))}
        </Stack>
      )}
    </Alert>
  );
}

function normalize_messages(input: MessageInput): string[] {
  if (typeof input === "string") return [input];

  if (Array.isArray(input)) return input;

  if (axios.isAxiosError(input))
    return parse_api_error(input).errors.map((error) => error.message);

  return [input.message];
}
