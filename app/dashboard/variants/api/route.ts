import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";






export async function GET() {

    try {
        const variants = await prisma.variant.findMany()

        if (!variants) return null

        return NextResponse.json(variants, {status: 400})
    } catch (error) {
        console.error('Fetching Variants failed', error)
        return NextResponse.json({
            error: 'Error in fetch the variants in server'
        } , {status: 500})
    }
}



export async function POST(req: Request) {

    try {
        const body = await req.json()
        if (!body?.productId) return NextResponse.json({ error: 'productId Required' }, { status: 500 })

        // create minimal placeholder variant 
        const variant = await prisma.variant.create({
            data: {
                productId: body.productId,
                name: body.name ?? 'Untitled',
                sku: body.sku ?? '',
                price: body.price ?? 0,
                stock: body.stock ?? 0,
                attributes: body.attributes ?? {},
                isDraft: true
            }
        })

        return NextResponse.json({ id: variant.id, variant })
    } catch (error) {
        console.error('Error Creating a Placeholder Variant', error)
        return NextResponse.json({ error: 'Failed to create a placeholder variant' }, { status: 500 })
    }
}