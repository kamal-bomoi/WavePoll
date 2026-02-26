import { type NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

/**
 * Handle GET requests to perform an authenticated Redis health check and return service status.
 *
 * @param req - Incoming request; must include an `Authorization` header with the value `Bearer {CRON_SECRET}`.
 * @returns A NextResponse:
 * - On success: JSON `{ status: "ok", timestamp: <ISO timestamp> }`.
 * - If `CRON_SECRET` is not set: 500 with body `"Server misconfigured"`.
 * - If the authorization header is missing or invalid: 401 with body `"Unauthorized"`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) return new NextResponse("Server misconfigured", { status: 500 });

  const authorization = req.headers.get("authorization");

  if (authorization !== `Bearer ${secret}`)
    return new NextResponse("Unauthorized", {
      status: 401
    });

  await redis.ping();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
}
