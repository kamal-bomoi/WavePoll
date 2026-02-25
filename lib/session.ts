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

export async function get_or_set_anon_id(): Promise<string> {
  const session = await get_session();

  if (session.anon_id) return session.anon_id;

  session.anon_id = nanoid();

  await session.save();

  return session.anon_id;
}

export async function get_anon_id_strict(): Promise<string> {
  const session = await get_session();

  if (!session.anon_id) throw WavePollError.Unauthorized();

  return session.anon_id;
}

export async function assert_owner(owner_id: string): Promise<void> {
  const anon_id = await get_anon_id_strict();

  if (anon_id !== owner_id) throw WavePollError.Unauthorized();
}

async function get_session(): Promise<IronSession<SessionData>> {
  try {
    return await getIronSession<SessionData>(await cookies(), session_options);
  } catch {
    throw WavePollError.BadRequest(
      "Invalid session. Please clear your cookies and try again."
    );
  }
}
