import { customAlphabet } from "nanoid";

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  special: "!@#$%^&*()-_+=[]{}|;:,.<>?"
};

const presets = new Map<string, (size?: number) => string>();

export const nanoid = ({
  charsets = ["uppercase", "lowercase", "numbers"],
  length
}: {
  charsets?: string | (keyof typeof CHARSETS)[];
  length?: number;
} = {}): string => {
  const alphabet =
    typeof charsets === "string"
      ? charsets
      : [...new Set(charsets)].map((charset) => CHARSETS[charset]).join("");

  if (!presets.has(alphabet)) presets.set(alphabet, customAlphabet(alphabet));

  // biome-ignore lint/style/noNonNullAssertion: <>
  return presets.get(alphabet)!(length);
};
