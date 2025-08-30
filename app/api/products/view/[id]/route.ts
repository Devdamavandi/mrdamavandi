


/**
 * This api is for incrementing each products
 * click view every time a product is clicked on.
 */

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";


export async function PUT(req: Request, { params }: { params: { id: string } }) {

    try {
        const { id } = await params
        const found = await prisma.product.findUnique({
            where: { id }
        })
        console.log('Found product in product view: ', found)
        if (!found) return NextResponse.json({ error: 'Failed to find the certain product' }, { status: 404 })

        const updatedView = await prisma.product.update({
            where: { id: found.id },
            data: {
                views: { increment: 1 }
            }
        })
        console.log('Now the Updated Product view is: ', updatedView)
        return NextResponse.json(updatedView, { status: 200 })
    } catch (error) {
        console.error('failed to update click count(server): ', error)
        return NextResponse.json({ error: 'failed to update click count' }, { status: 500 })
    }
}