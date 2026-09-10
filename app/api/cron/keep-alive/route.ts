import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results: Record<string, string> = {};

  try {
    await db.execute(sql`SELECT 1`);
    results.db = "ok";
  } catch (e) {
    results.db = `error: ${e instanceof Error ? e.message : "unknown"}`;
  }

  try {
    const pong = await redis.ping();
    results.redis = pong === "PONG" ? "ok" : pong;
  } catch (e) {
    results.redis = `error: ${e instanceof Error ? e.message : "unknown"}`;
  }

  return NextResponse.json({ timestamp: new Date().toISOString(), ...results });
}
