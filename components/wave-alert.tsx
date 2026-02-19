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

  const props = type_props(type);

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

function type_props(type: WaveAlertType): {
  color: string;
  icon: ReactNode;
  title: string;
} {
  const size = 24;

  if (type === "success")
    return {
      color: "teal",
      title: "Success",
      icon: <IconCircleCheck size={size} />
    };

  if (type === "warning")
    return {
      color: "orange",
      title: "Warning",
      icon: <IconAlertTriangle size={size} />
    };

  if (type === "error")
    return {
      color: "red",
      title: "Error",
      icon: <IconAlertCircle size={size} />
    };

  if (type === "info")
    return {
      color: "indigo",
      title: "Info",
      icon: <IconInfoCircle size={size} />
    };

  throw new Error(`Invalid alert type: "${type}".`);
}
