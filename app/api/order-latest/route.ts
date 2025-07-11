import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";




export async function GET() {

    const session  = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized'}, {status: 401})

    const order = await prisma.order.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            items: { include: { product: true, variant: true } }
        }
    })

    return NextResponse.json(order)
}