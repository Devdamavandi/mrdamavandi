import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"



export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const data = await req.formData()
    const carrier = data.get('carrier') as string
    const trackingNumber  = data.get('trackingNumber') as string

    await prisma.order.update({
        where: { id: params.id },
        data: { carrier, trackingNumber }
    })

    return NextResponse.redirect('/dashboard/orders')
}