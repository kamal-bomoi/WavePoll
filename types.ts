import type { AxiosError } from "axios";
import type { Merge } from "type-fest";
import type { OptionRow, PollDetail, VoteRow } from "./lib/db/schema";

export type AnyObject = Record<string, any>;

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

export type Poll = Merge<
  Omit<PollDetail, "owner_id" | "owner_email">,
  {
    owner_email?: PollDetail["owner_email"];
    presence: number;
    options: Option[];
  }
>;

export interface Generated extends Timestamps {
  id: string;
}

export type Vote = Omit<VoteRow, "poll_id" | "anon_id">;

export interface PollResponsesPage {
  items: Vote[];
  limit: number;
  has_more: boolean;
  next_cursor: PollResponsesCursor | null;
}

export interface PollResponsesCursor {
  created_at: string;
  id: string;
}

export type Option = Prettify<
  Pick<OptionRow, "id" | "value"> & {
    votes: number;
  }
>;

export interface ErrorProps {
  message: string;
  path?: string;
  [key: string]: string | number | boolean | undefined;
}

export type ApiError = AxiosError<{ errors: ErrorProps[] }>;

export interface UploadUrl {
  key: string;
  url: string;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Fn = (...args: any[]) => any;

export type Nullish<T> = T | null | undefined;

export type Nullishify<T> = {
  [K in keyof T]: null extends T[K] ? T[K] | undefined : T[K];
};
