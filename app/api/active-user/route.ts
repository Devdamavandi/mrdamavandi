import { NextRequest, NextResponse } from "next/server";
import { getActiveUserCount, getActiveUsersToday, userActive } from "@/lib/activeUsers";


export async function POST(request: NextRequest) {
    const { guestId } = await request.json()
    await userActive(guestId)
    return NextResponse.json({ success: true })
}

export async function GET(request: NextRequest) {
    if (request.nextUrl.searchParams.get("today") === "true") {
        const count = await getActiveUsersToday()
        return NextResponse.json({ count })
    }
    const count = await getActiveUserCount()
    return NextResponse.json({ count })
}

