import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PaymentMethod } from "@prisma/client";
import { ObjectId } from "bson";




interface ItemsProps {
    items: {
        productId: string
        variantId?: string
        quantity: number
        priceAtPurchase: number
    }[];
    billingAddressId: string
    shippingAddressId: string
    paymentMethod: string
    shippingCost: number
    discount?: number
}

export async function createOrder({
    items,
    billingAddressId,
    shippingAddressId,
    paymentMethod,
    shippingCost,
    discount

} : ItemsProps) {

    const session = await auth()
    if (!session?.user) throw new Error("Not authenticated!")

    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.priceAtPurchase, 0)

    const tax = 0 // For Now
    const total = subtotal + shippingCost - (discount || 0)

    const order = prisma.order.create({
        data: {
            userId: session?.user.id,
            orderNumber: new ObjectId().toHexString().slice(-8), // Unique readable ID
            billingAddressId,
            shippingAddressId,
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
                    priceAtPurchase: i.priceAtPurchase
                })),
            },
        },
    })

    return order
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


export async function getAllOrders() {
    return prisma.order.findMany({
        include: {
            user: true,
            shippingAddress: true,
            items: { include: { product: true, variant: true } }
        },
        orderBy: { createdAt: 'desc' },
    })
}