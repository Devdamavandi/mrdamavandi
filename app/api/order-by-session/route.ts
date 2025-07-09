import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";




export async function GET(req: NextRequest) {

    const session_id = req.nextUrl.searchParams.get('session_id')

    if (!session_id) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
        where: { orderNumber: session_id },
        include: {
            items: {
                include: {
                    product: true,
                    variant: true
                },
            },
            user: true,
            shippingAddress: true
        },
    })


    if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
}