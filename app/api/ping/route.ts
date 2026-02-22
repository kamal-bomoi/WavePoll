import { type NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("authorization");

  if (authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return new NextResponse("Unauthorized", {
      status: 401
    });

  await redis.ping();

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
}
