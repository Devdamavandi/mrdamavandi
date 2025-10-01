import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"



export async function GET(req: Request) {

    try {
            const { searchParams } = new URL(req.url)
            const userId = searchParams.get('userId')

            if (!userId) return NextResponse.json({ error: 'No userId provided.' }, { status: 400 })
        
            const foundUser = await prisma.user.findUnique({
                where: { id: userId }
            })
        
            if (!foundUser) return NextResponse.json({ error: 'User not found to show its orders!' }, { status: 404 })
        
            const foundOrder = await prisma.order.findMany({
                where: { userId: foundUser.id },
                select: { 
                    id: true,
                    items: true, 
                    createdAt: true, 
                    shippingCost: true,
                    status: true,
                    total: true,
                    trackingNumber: true,
                    paymentMethod: true,
                    paymentStatus: true,
                    carrier: true,
                    orderNumber: true,
                    _count: true
                }
            })
        
            return NextResponse.json(foundOrder)
    } catch (err) {
        console.error('Failed to Get Customer Orders in Backend', err)
        return NextResponse.json({ error: 'Failed to Get Customer Orders(backend)' }, { status: 500 })
    }

}