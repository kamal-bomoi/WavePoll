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

/**
 * Render an Alert component for the provided message(s) and alert type.
 *
 * @param message - The content to display; may be a string, string array, Axios/ApiError (will be parsed), or an Error.
 * @param type - Visual variant of the alert (`"info" | "success" | "warning" | "error"`).
 * @param title - Optional title to display instead of the type's default title.
 * @returns An Alert element configured with the specified type and messages, or `null` when there are no messages. When multiple messages are provided, they are rendered as a vertical list of entries. 
 */
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

/**
 * Convert a flexible message input into an array of message strings.
 *
 * @param input - A message value which may be a single string, an array of strings, an Axios/ApiError-like response containing one or more error messages, or a generic Error.
 * @returns An array of message strings extracted from `input`.
 */
function normalize_messages(input: MessageInput): string[] {
  if (typeof input === "string") return [input];

  if (Array.isArray(input)) return input;

  if (axios.isAxiosError(input))
    return parse_api_error(input).errors.map((error) => error.message);

  return [input.message];
}
