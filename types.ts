import type { AxiosError } from "axios";

export type AnyObject = Record<string, any>;

export type PollType = "single" | "multiple" | "rating" | "text";
export type PollLifecycle = "draft" | "live" | "ended";

export interface PollTrendPoint {
  label: string;
  votes: number;
}

export interface Poll {
  id: string;
  owner_email?: string;
  title: string;
  description: string;
  type: PollType;
  lifecycle: PollLifecycle;
  options: Option[];
  start_at?: string;
  end_at?: string;
  allow_multiple_votes: boolean;
  presence: number;
  reactions_enabled: boolean;
  reaction_emojis: string[];
  reactions_count: number;
  text_responses_count: number;
  total_votes: number;
  rating_average?: number;
  embed_url: string;
  created_at: string;
  updated_at: string;
}

export interface Option {
  id: string;
  label: string;
  votes: number;
  trend: PollTrendPoint[];
}

export interface CreatePollPayload {
  owner_email?: string;
  title: string;
  description?: string;
  type: PollType;
  options?: string[];
  start_at?: string;
  end_at?: string;
  reactions_enabled?: boolean;
  reaction_emojis?: string[];
}

export interface VotePollPayload {
  option_ids?: string[];
  rating?: number;
  comment?: string;
}

export interface ErrorProps {
  message: string;
  path?: string;
  [key: string]: string | number | boolean | undefined;
}

export type ApiError = AxiosError<{ errors: ErrorProps[] }>;
