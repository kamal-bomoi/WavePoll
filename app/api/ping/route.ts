import { type NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

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
