


/**
 * This API is for Creating a Top Products
 * Array to be used on dashboard main page Top Products
 * Criteria Select Box
 */


import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { Product } from "@prisma/client"


export async function GET(req: Request) {

    try {
       
        const { searchParams } = new URL(req.url)
        const criteria = searchParams.get("criteria")
        
        
        let topProducts: Product[] = []
        
        switch (criteria) {
            case 'most-purchased':
                // first fetch all products with their OrderItems.
                const purchasedProducts = await prisma.product.findMany({
                    include: { OrderItem: true },
                });
                // then create a temporary purchaseCount by summing quantities from all OrderItems
                topProducts = purchasedProducts
                    .map(product => ({
                        ...product,
                        purchaseCount: product.OrderItem.reduce((sum, item) => sum + item.quantity, 0)
                    }))
                    .sort((a, b) => b.purchaseCount - a.purchaseCount)
                    .slice(0, 6);
                break;
            case 'most-viewed':
                topProducts = await prisma.product.findMany({
                    orderBy: {
                        views: 'desc'
                    },
                    take: 6
                })
                break;
            case 'most-wishlisted':
                /** Because MongoDB doesnt support orderBy on relation counts, 
                 * I must sort by wishlist count in javascript code here👇
                 */
                // first , fetch products and their wishlists
                const products = await prisma.product.findMany({
                    include: { WishlistItem: true },
                });
                // then, count the wishlists in Javascript
                topProducts = products
                    .map(product => ({
                        ...product,
                        wishlistCount: product.WishlistItem.length
                    }))
                    .sort((a, b) => b.wishlistCount - a.wishlistCount) // then here, sort the products by their wishlists
                    .slice(0, 6); // and finally take out 6 of them.
                break;
            case 'highest-revenue':
                const revenueProducts = await prisma.product.findMany({});
                topProducts = revenueProducts
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 6);
                break;
            default: 
                topProducts = []
        }

        
        return NextResponse.json({ topProducts })
    } catch (error) {
        console.error('Failed to fetch Top Products!!', error)
        return NextResponse.json({ error: "Failed to fetch top products" }, { status: 500 })
    }
}