import type { AxiosError } from "axios";

export type AnyObject = Record<string, any>;

// todo: for v2, what more we need based on new features
export interface Poll {
  id: string;
  title: string;
  options: Option[];
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// todo: for v2 what we need
export interface Option {
  id: string;
  value: string;
  votes: number;
}

// todo: for v2
export interface CreatePollPayload {
  title: string;
}

// todo v2: do we need more based on additional features
export interface VotePollPayload {
  option_id: string;
}

export interface ErrorProps {
  message: string;
  path?: string;
  [key: string]: string | number | boolean | undefined;
}

export type ApiError = AxiosError<{ errors: ErrorProps[] }>;
