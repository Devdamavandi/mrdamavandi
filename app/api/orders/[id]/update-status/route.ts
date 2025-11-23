import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { OrderStatus } from "@prisma/client"

import { withCors, handleOptions } from "@/lib/cors";

export function OPTIONS() {
  return handleOptions();
}

export async function POST(req:Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const data = await req.formData()
    const status = data.get('status') as string | null

    await prisma.order.update({
        where: { id: params.id },
        data: { status: status ? status as OrderStatus : undefined }
    })

    return withCors(NextResponse.json('/dashboard/orders'))
}