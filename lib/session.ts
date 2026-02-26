import "server-only";
import {
  getIronSession,
  type IronSession,
  type SessionOptions
} from "iron-session";
import { cookies } from "next/headers";
import { env } from "@/env";
import { nanoid } from "@/utils/nanoid";
import { WavePollError } from "@/utils/wave-poll-error";

export interface SessionData {
  anon_id?: string;
}

const session_options: SessionOptions = {
  cookieName: "wavepoll_session",
  password: env.COOKIE_SECRET,
  ttl: 60 * 60 * 24 * 365 * 10,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  }
};

/**
 * Ensure an anonymous session identifier exists for the current session and return it.
 *
 * If the session does not already contain an `anon_id`, a new identifier is generated,
 * assigned to the session, and the session is saved.
 *
 * @returns The session's `anon_id` string.
 */
export async function get_or_set_anon_id(): Promise<string> {
  const session = await get_session();

  if (session.anon_id) return session.anon_id;

  session.anon_id = nanoid({ length: 8 });

  await session.save();

  return session.anon_id;
}

/**
 * Retrieve the current session's anonymous identifier, failing if absent.
 *
 * @returns The session's `anon_id` string.
 * @throws WavePollError.Unauthorized if the current session does not contain an `anon_id`.
 */
export async function get_anon_id_strict(): Promise<string> {
  const session = await get_session();

  if (!session.anon_id) throw WavePollError.Unauthorized();

  return session.anon_id;
}

/**
 * Verifies that the current session's anon_id matches the provided owner identifier.
 *
 * @param owner_id - The expected anon identifier to validate against the session
 * @throws WavePollError.Unauthorized - if the session has no anon_id or the anon_id does not match `owner_id`
 */
export async function assert_owner(owner_id: string): Promise<void> {
  const anon_id = await get_anon_id_strict();

  if (anon_id !== owner_id) throw WavePollError.Unauthorized();
}

/**
 * Obtain the IronSession associated with the current request.
 *
 * @returns The session object for the current request (`IronSession<SessionData>`).
 * @throws WavePollError.BadRequest if the session cannot be retrieved (e.g., corrupted or invalid cookies).
 */
async function get_session(): Promise<IronSession<SessionData>> {
  try {
    return await getIronSession<SessionData>(await cookies(), session_options);
  } catch {
    throw WavePollError.BadRequest(
      "Invalid session. Please clear your cookies and try again."
    );
  }
}
