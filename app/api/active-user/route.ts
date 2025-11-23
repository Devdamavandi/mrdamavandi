import { NextRequest, NextResponse } from "next/server";
import { getActiveUserCount, getActiveUsersToday, userActive } from "@/lib/activeUsers";
import redis from "@/lib/redis"; // Import your redis instance

import { withCors, handleOptions } from "@/lib/cors";

export function OPTIONS() {
  return handleOptions();
}

// Logging for Redis
redis.on('error', (err: Error) => console.log('Redis Error:', err));
redis.on('connect', () => console.log('Redis connected'));



export async function POST(request: NextRequest) {
    const { guestId } = await request.json()
    await userActive(guestId)
    return withCors(NextResponse.json({ success: true }))
}

export async function GET(request: NextRequest) {
    if (request.nextUrl.searchParams.get("today") === "true") {
        const count = await getActiveUsersToday()
        return NextResponse.json({ count })
    }
    const count = await getActiveUserCount()
    return withCors(NextResponse.json({ count }))
}

