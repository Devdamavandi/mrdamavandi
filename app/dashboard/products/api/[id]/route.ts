import {prisma} from "@/lib/db";
import { NextResponse } from "next/server";


// GEt single product server code
export async function GET(request: Request, {params} : {params: {id: string}}) {

    try {
        const {id} = await params
        const product = await prisma.product.findUnique({
            where: {id},
            include: {
                category: true
            }
        })

        if (!product) return NextResponse.json({error: 'Product not Found!'}, {status: 404})
        return NextResponse.json(product)
    } catch {
        return NextResponse.json({
            error: 'Failed to fetch this product'
        }, {status: 500})
    }
}


// Update single product server code
export async function PUT(request: Request, {params} : {params: {id: string}}) {

    try {
        const {id} = await params

        const body = await request.json()


      const product = await prisma.product.update({
        where: {id},
        data: {
            // Explicitly specify only updatable fields
            name: body.name,
            description: body.description,
            price: body.price,
            stock: body.stock,
            images: body.images,
            categoryId: body.categoryId
            // Omit createdAt and updatedAt as they're managed by Prisma
        },
    })


        if (!product) {
            return NextResponse.json(
                {error: 'Failed to update product'}, {status: 400}
            )
        }
        return NextResponse.json(product)
    } catch{
        return NextResponse.json({
            error: 'Failed to update the product'
        },{status: 500})
    }
}


// Delete single product server code
export async function DELETE(request: Request, {params} : {params: {id: string}}) {

    try {

        const id = await params.id
        
        const product = await prisma.product.delete({
            where: {id}
        })
        return NextResponse.json({message: `Product '${product.name}' Deleted Successfully!`})
    } catch {
        return NextResponse.json({
            error: 'Failed to delete the product'
        }, {status: 500})
    }
}