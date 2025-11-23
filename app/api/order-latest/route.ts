import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";


import { withCors, handleOptions } from "@/lib/cors";

export function OPTIONS() {
  return handleOptions();
}

export async function GET() {

    const session  = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized'}, {status: 401})

    const latestOrder = await prisma.order.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            items: { include: { product: true, variant: true } },
            shippingAddress: true,
            billingAddress: true
        }
    })

    return withCors(NextResponse.json(latestOrder))
}