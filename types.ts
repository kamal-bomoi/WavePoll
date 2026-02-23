import type { AxiosError } from "axios";
import type { Merge } from "type-fest";
import type {
  OptionRow,
  PollDetail,
  PollRow,
  ReactionRow,
  VoteRow
} from "./lib/db/schema";

export type AnyObject = Record<string, any>;

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

export type Poll = Merge<
  PollDetail,
  {
    presence: number;
    options: Option[];
  }
>;

export interface Generated extends Timestamps {
  id: string;
}

export type Vote = Omit<VoteRow, "poll_id" | "voter_key">;

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

export type CreatePollPayload = Merge<
  Omit<PollRow, keyof Generated>,
  {
    options: string[] | null;
    end_at: string;
  }
>;

export type VotePayload =
  | { reaction?: Nullish<ReactionRow["emoji"]>; option_id: string }
  | { reaction?: Nullish<ReactionRow["emoji"]>; rating: number }
  | { reaction?: Nullish<ReactionRow["emoji"]>; comment: string };

export interface ErrorProps {
  message: string;
  path?: string;
  [key: string]: string | number | boolean | undefined;
}

export type ApiError = AxiosError<{ errors: ErrorProps[] }>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Fn = (...args: any[]) => any;

export type Nullish<T> = T | null | undefined;
