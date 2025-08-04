import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { OrderStatus } from "@prisma/client"



export async function POST(req:Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const data = await req.formData()
    const status = data.get('status') as string | null

    await prisma.order.update({
        where: { id: params.id },
        data: { status: status ? status as OrderStatus : undefined }
    })

    return NextResponse.json('/dashboard/orders')
}