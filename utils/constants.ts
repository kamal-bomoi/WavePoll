export const MAX_REACTION_EMOJIS = 5;
export const MAX_TEXT_RESPONSE_LENGTH = 280;

export const POLL_IDS_KEY = "wavepoll.poll_ids";
export const POLL_HISTORY_IDS_KEY = "wavepoll.poll_history_ids";

export const PAGINATION_LIMIT = 20;

export const PRESENCE_TIMEOUT_MS = 30_000;
export const PRESENCE_HEARTBEAT_TTL_SECONDS = 60;

export const VIEWER_ID_KEY = "wavepoll_viewer_id";
export const HEARTBEAT_INTERVAL_MS = 10_000;

export const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif"
] as const;

export const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB
export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 5;
export const SIGNED_URL_EXPIRY_SECONDS = 60 * 5; // 5 minutes
