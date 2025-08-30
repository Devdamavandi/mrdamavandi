import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PaymentMethod } from "@prisma/client";
import { ObjectId } from "bson";
import { NextResponse } from "next/server";


type addressProps = {
    id: string
    street: string
    city: string
    state: string
    zipCode?: string
    country: string
    isDefault?: string
}

interface ItemsProps {
    items: {
        productId: string
        variantId?: string
        quantity: number
        priceAtPurchase: number
    }[];
    billingAddress: addressProps
    shippingAddress: addressProps
    paymentMethod: string
    shippingCost: number
    discount?: number
}


export async function createOrder({
    items,
    billingAddress,
    shippingAddress,
    paymentMethod,
    shippingCost,
    discount

} : ItemsProps) {

    const session = await auth()
    if (!session?.user) throw new Error("Not authenticated!")

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.priceAtPurchase, 0)

    const tax = 0 // For Now
    const total = subtotal + shippingCost - (discount || 0)


    const billing = await prisma.address.create({
        data: {
            userId: session?.user.id,
            street: billingAddress.street,
            city: billingAddress.city,
            state: billingAddress.state,
            zipCode: billingAddress.zipCode || '',
            country: billingAddress.country
        }
    })
    
    const shipping = await prisma.address.create({
        data: {
            userId: session?.user.id,
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode || '',
            country: shippingAddress.country
        }
    })

    const createdOrder = await prisma.order.create({
        data: {
            userId: session?.user.id,
            orderNumber: new ObjectId().toHexString().slice(-8), // Unique readable ID
            billingAddressId: billing?.id,
            shippingAddressId: shipping?.id,
            subtotal,
            tax,
            shippingCost,
            discount: discount || 0,
            total,
            paymentMethod: paymentMethod as PaymentMethod,
            items: {
                create: items.map((i) => ({
                    productId: i.productId,
                    variantId: i.variantId,
                    quantity: i.quantity,
                    priceAtPurchase: i.priceAtPurchase,
                })),
            },
        },
        include: { items: true } // include items so we can update product's revenue
    })

    // update product.revenue for each order item (server-side)
    try {
        // multiply prices by 100 to store revenue in cents as Int
        await prisma.$transaction(
            createdOrder.items.map(item =>
                prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        revenue: {
                            increment: Math.round((item.priceAtPurchase ?? 0) * item.quantity * 100)
                        }
                    }
                })
            )
        )
    } catch (err) {
        console.error('Failed to update product revenue', err)
    }

    return createdOrder
}


export async function getUserOrders() {
    const session = await auth()
    if (!session?.user) return []

    return prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
            items: { include: { product:true, variant: true }},
            shippingAddress: true
        },
        orderBy: { createdAt: 'desc' },
    })
}


export async function getRecentOrders(req: Request) {
    try {
        const url = new URL(req.url)
        const limit = Math.max(1, Math.min(100,Number(url.searchParams.get("limit") ?? 10)))

        const recents = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            items: {
                include: {
                    product: {
                        select: { id: true, name: true, images: true, sku: true, price: true, slug: true }
                    }
                }
            },
            user: { select: { id: true, name: true, email: true } }
        }
    })

    return NextResponse.json({ recents })
    } catch (err) {
        console.error('Failed to fetch recent orders: ', err)
        return NextResponse.json({ error: 'Failed to fetch recent orders' }, { status: 500 })
    }
}


export async function getAllOrders() {
    return prisma.order.findMany({
        where: {
            paymentStatus: 'PAID'
        },
        include: {
            user: true,
            shippingAddress: true,
            billingAddress: true,
            items: { include: { product: true, variant: true } }
        },
        orderBy: { createdAt: 'desc' },
    })
}



export async function finalizeOrderAndAdjustStock (orderId: string) {
    // Load Order + items with product info
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    })
    if (!order) throw new Error('Order not found!(Server)')
    if (order.paymentStatus === 'PAID') return order // idempotent

    // fetch current stock for all products involved
    const productIds = order.items.map(i => i.productId)
    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true }
    })

    // create an array for these products including their IDs and stocks
    const stockMap = Object.fromEntries(products.map(p => [p.id, p.stock ?? 0]))

    //  verify availability
    for (const item of order.items) {
        const have = stockMap[item.productId] ?? 0
        if ( have < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productId}`)
        }
    }


    // prepare updates
    const updates = order.items.map(item => 
        prisma.product.update({
            where: { id: item.productId },
            data: {
                stock: { decrement: item.quantity },
                revenue: { increment:  (item.priceAtPurchase ?? 0) * item.quantity}
            }
        })
    )

    // update order status + product updates in a transaction if supported
    try {
        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { 
                    paymentStatus: 'PAID',
                    updatedAt: new Date(),
                    ...updates
                 },
            }),
        ])
    } catch (err) {
        console.error('Transaction failed, fallback not implemented: ', err)
        throw err
    }

    return await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
    })
}
