



import {prisma} from '@/lib/db'
import { NextResponse } from 'next/server'


export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {productID, userID} = body
        const wishItem = await prisma.wishlistItem.create({
            data: {
                productId: productID,
                userId: userID,
            }
        })
        return NextResponse.json(wishItem, {status: 201})
    } catch (error) {
        console.error('Error Creating WishItem')
        if (error instanceof Error) {
            return NextResponse.json(
            { error: 'Failed Creating Wishlist Item'},
            {status: 500}
        )
        }
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json()
        const {userID, productID} = body

        const wishlistItem = await prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId: userID,
                    productId: productID 
                }
            }
        })

        if (!wishlistItem) return NextResponse.json({ error: 'WishlistItem Not found!'}, {status: 404})

        await prisma.wishlistItem.delete({
            where: {
                userId_productId: {
                    userId: wishlistItem.userId,
                    productId: wishlistItem.productId
                }
            }
        })

        return NextResponse.json({ message: `WishlistItem ${wishlistItem.id} deleted successfully!`})
    } catch {
        return NextResponse.json(
            {error: 'Failed to delete the product'},
            {status: 500}
        )
    }
}