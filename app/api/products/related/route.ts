



import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";


export async function POST(req: Request) {

    try {
        const body = await req.json()
        const { categoryId, productId } = body
    
        const relatedProducts = await prisma.product.findMany({
            where: { 
                categoryId,
                NOT: { id: productId }
             }
        })
    
        if (!relatedProducts) {
            return NextResponse.json({ error: 'Related Products Not Found(server)' }, { status: 404 })
        }
    
        return NextResponse.json(relatedProducts, { status: 200 })
    } catch (error) {
        console.error('Failed to fetch Related Products(server): ', error)
        return NextResponse.json(
            { error: 'Failed to fetch Related PRoducts(server side)' },
            { status: 500 }
        )
    }
}