import dayjs from "dayjs";
import { z } from "zod";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_FILE_SIZE,
  MAX_OPTIONS,
  MAX_TEXT_RESPONSE_LENGTH,
  MIN_OPTIONS
} from "@/utils/constants";
import { poll_status, poll_type } from "./db/schema";

export type CreatePollInput = z.infer<typeof CreatePollSchema>;
export const CreatePollSchema = z
  .object({
    owner_email: z.email().nullable(),
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters long.")
      .max(80, "Title must be at most 80 characters long."),
    description: z
      .string()
      .max(300, "Description must be at most 300 characters long.")
      .nullable(),
    type: z.enum(poll_type.enumValues),
    status: z.enum(poll_status.enumValues),
    reaction_emojis: z.array(z.string()).min(1).nullable(),
    end_at: z.iso.datetime(),
    options: z.array(z.string()).min(MIN_OPTIONS).max(MAX_OPTIONS).nullable()
  })
  .superRefine((body, ctx) => {
    const end_at = dayjs(body.end_at);
    const min_time = dayjs().add(5, "minute");

    if (!end_at.isValid() || end_at.isBefore(min_time))
      ctx.addIssue({
        code: "custom",
        path: ["end_at"],
        message: "End time must be at least 5 minutes from now."
      });

    if ((body.type === "single" || body.type === "image") && !body.options)
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Options are required for single choice and image polls."
      });
  });

export type UploadUrlsInput = z.infer<typeof UploadUrlsSchema>;
export const UploadUrlsSchema = z.object({
  files: z
    .array(
      z.object({
        content_type: z.enum(ALLOWED_CONTENT_TYPES, {
          error: `Invalid image type. Allowed types: ${ALLOWED_CONTENT_TYPES.map(
            (t) => t.replace("image/", "").toUpperCase()
          ).join(", ")}.`
        }),
        content_length: z.number().int().min(1).max(MAX_FILE_SIZE, {
          error: "Image size must not exceed 5MB."
        })
      })
    )
    .min(1)
    .max(MAX_OPTIONS)
});

export type UpdatePollInput = z.infer<typeof UpdatePollSchema>;
export const UpdatePollSchema = z
  .object({
    owner_email: z.email().nullable().optional(),
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters long.")
      .max(80, "Title must be at most 80 characters long."),
    status: z.enum(poll_status.enumValues),
    description: z
      .string()
      .max(300, "Description must be at most 300 characters long.")
      .nullable(),
    type: z.enum(poll_type.enumValues),
    reaction_emojis: z.array(z.string()).min(1).nullable(),
    end_at: z.iso.datetime(),
    options: z.array(z.string()).min(MIN_OPTIONS).max(MAX_OPTIONS).nullable()
  })
  .superRefine((body, ctx) => {
    const end_at = dayjs(body.end_at);
    const min_time = dayjs().add(5, "minute");

    if (!end_at.isValid() || end_at.isBefore(min_time))
      ctx.addIssue({
        code: "custom",
        path: ["end_at"],
        message: "End time must be at least 5 minutes from now."
      });

    if ((body.type === "single" || body.type === "image") && !body.options)
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "Options are required for single choice and image polls."
      });
  });

export type PollParamsInput = z.infer<typeof PollIdSchema>;
export const PollIdSchema = z.object({
  poll_id: z.string()
});

export type CastVoteInput = z.infer<typeof CastVoteSchema>;
export const CastVoteSchema = z.union([
  z.object({
    reaction: z.string().trim().min(1).nullish(),
    option_id: z.string().trim().min(1)
  }),
  z.object({
    reaction: z.string().trim().min(1).nullish(),
    rating: z.number().int().min(1).max(5)
  }),
  z.object({
    reaction: z.string().trim().min(1).nullish(),
    comment: z
      .string()
      .trim()
      .min(1)
      .max(
        MAX_TEXT_RESPONSE_LENGTH,
        `Comment must be at most ${MAX_TEXT_RESPONSE_LENGTH} characters.`
      )
  })
]);

export type PaginationQueryInput = z.infer<typeof PaginationSchema>;
export const PaginationSchema = z
  .object({
    cursor_created_at: z.string().optional(),
    cursor_id: z.string().optional()
  })
  .superRefine((value, ctx) => {
    const has_created_at = !!value.cursor_created_at;
    const has_id = !!value.cursor_id;

    if (has_created_at !== has_id)
      ctx.addIssue({
        code: "custom",
        message: "cursor_created_at and cursor_id must be provided together."
      });
  });

export type IndicatePresenceInput = z.infer<typeof IndicatePresenceSchema>;
export const IndicatePresenceSchema = z.object({
  action: z.enum(["join", "heartbeat", "leave"]),
  viewer_id: z.string().trim().length(21)
});
