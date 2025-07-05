import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { OrderStatus } from "@prisma/client"



export async function POST(req:Request, { params }: { params: { id: string } }) {

    const data = await req.formData()
    const status = data.get('status') as string | null

    await prisma.order.update({
        where: { id: params.id },
        data: { status: status ? status as OrderStatus : undefined }
    })

    return NextResponse.json('/dashboard/orders')
}