import type { AxiosError } from "axios";
import type { Database, Tables, TablesInsert } from "@/lib/supabase/types";

export type PollRow = Tables<"polls">;

export type OptionRow = Tables<"options">;

export type VoteRow = Tables<"votes">;

export type ReactionRow = Tables<"reactions">;

export type PollWithOptions = PollRow & { options?: OptionRow[] };

export type AnyObject = Record<string, any>;

export type PollType = Database["public"]["Enums"]["poll_type"];
export type PollStatus = Database["public"]["Enums"]["poll_status"];

export interface PollTrendPoint {
  label: string;
  votes: number;
}

export type PollResponse = Pick<
  Tables<"votes">,
  "id" | "option_id" | "rating" | "comment" | "created_at"
>;

export interface PollResponsesPage {
  items: PollResponse[];
  limit: number;
  has_more: boolean;
  next_cursor: PollResponsesCursor | null;
}

export interface PollResponsesCursor {
  created_at: string;
  id: string;
}

export interface ReactionCount {
  emoji: string;
  count: number;
}

export type Option = Pick<Tables<"options">, "id" | "value"> & {
  votes: number;
  trend: PollTrendPoint[];
};

export type Poll = Pick<
  Tables<"polls">,
  | "id"
  | "title"
  | "description"
  | "type"
  | "status"
  | "created_at"
  | "updated_at"
> & {
  type: PollType;
  status: PollStatus;
  owner_email?: string | null;
  end_at: string;
  reaction_emojis?: string[] | null;
  options: Option[];
  presence: number;
  reactions_count: number;
  text_responses_count: number;
  total_votes: number;
  rating_average?: number;
  reaction_breakdown: ReactionCount[];
};

export interface CreatePollPayload {
  type: PollType;
  title: string;
  status: PollStatus;
  description?: TablesInsert<"polls">["description"];
  owner_email?: TablesInsert<"polls">["owner_email"];
  options?: string[];
  end_at: TablesInsert<"polls">["end_at"];
  reaction_emojis?: TablesInsert<"polls">["reaction_emojis"];
}

export type VotePayload =
  | { reaction?: Nullish<string>; option_id: string }
  | { reaction?: Nullish<string>; rating: number }
  | { reaction?: Nullish<string>; comment: string };

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
