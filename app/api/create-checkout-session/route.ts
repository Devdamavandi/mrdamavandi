
export const runtime = 'nodejs'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createHash } from 'crypto'



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CheckoutItem {
    name?: string | null;
    productId?: string | null;
    variantId?: string | null;
    price?: number | null;
    quantity?: number | null;
    stripePriceId?: string | null
}



// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function reserveAndCreateOrder(normalized: any[], billingAddress: any, shippingAddress: any, sessionUserId: string, idempotencyKey: string): Promise<any> {

    let attempt = 0

    while (attempt < 3) {
        try {
            return await prisma.$transaction(async (tx) => {
                // Reserve each variant atomically
                for (const item of normalized) {
                    
                    // First: Check everything about Variant
                    if (!item.variantId) continue

                    const variant = await prisma.variant.findUnique({
                        where: { id: item.variantId },
                        select: { id: true, stock: true }
                    })
                    if (!variant) {
                        return NextResponse.json({ error: 'NOT_FOUND', message: 'Product variant not found' }, { status: 404 })
                    }

                    if (variant.stock < item.quantity) {
                        return NextResponse.json({ error: 'OUT_OF_STOCK', message: 'THIS item is no longer available in the requested quantity' }, { status: 409 })
                    }


                    const res = await tx.variant.updateMany({
                        where: { id: item.variantId, stock: { gte: item.quantity } },
                        data: { stock: { decrement: item.quantity } }
                    })
                    if (res.count === 0) throw new Error(`Insufficient stock for variant ${item.variantId}`)
                }

                // Create billing and Shipping Addresses
                const billing = await tx.address.create({
                    data: { 
                        street: billingAddress?.street ?? '', 
                        city: billingAddress?.city ?? '',
                        state: billingAddress?.state ?? '',
                        zipCode: billingAddress?.zipCode ?? '',
                        user: { connect: { id: sessionUserId } }
                    }
                })

                const shipping = await tx.address.create({
                    data: {
                        street: shippingAddress?.street ?? '',
                        city: shippingAddress?.city ?? '',
                        state: shippingAddress?.state ?? '',
                        zipCode: shippingAddress?.zipCode ?? '',
                        user: { connect: { id: sessionUserId } }
                    }
                })

                // Create order in PENDING with orderNumber = idempotencyKey
                const order = await tx.order.create({
                    data: {
                        userId: sessionUserId,
                        orderNumber: idempotencyKey,
                        paymentStatus: 'PENDING',
                        paymentMethod: 'CREDIT_CARD',
                        tax: 0,
                        shippingCost: 0,
                        subtotal: normalized.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
                        total: normalized.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
                        items: {
                            create: normalized.map((item) => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const orderItem: any = {
                                    quantity: item.quantity,
                                    priceAtPurchase: item.price ?? 0,
                                };
                                if (item.productId) {
                                    orderItem.product = { connect: { id: item.productId } };
                                }
                                if (item.variantId) {
                                    orderItem.variant = { connect: { id: item.variantId } }
                                }
                                return orderItem;
                            }),
                        },
                        billingAddressId: billing.id,
                        shippingAddressId: shipping.id,
                    },
                    include: { 
                        items: true
                    },
                })

                return order
            }, { timeout: 20000 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            if (
                String(err.message).includes('Transaction failed due to a write conflict') && 
                attempt < 2
            ) {
                attempt++
                console.warn(`Retrying order creation (attempt ${attempt + 1})`)
            } else {
                throw err
            }
        }
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { items, billingAddress, shippingAddress } = await req.json()
        if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'Invalid Items' }, { status: 400 })

        // Normalize items
        const normalized = await Promise.all(
            items.map(async (i) => {
                // If client provided  stripePriceId, validate & fetch variant by stripePriceId
                if (i.stripePriceId) {
                    const variant = await prisma.variant.findUnique({
                        where: { stripePriceId: String(i.stripePriceId) },
                        select: { id: true, name: true, stock: true, price: true, productId: true, stripePriceId: true }
                    })
                    if (!variant) throw new Error(`Invalid stripeProceId: ${i.stripePriceId}`)
                    return {
                        variantId: variant?.id,
                        productId: variant?.productId,
                        price: variant?.price,
                        stripePriceId: variant.stripePriceId,
                        name: variant.name ?? 'Item',
                        quantity: Number(i.quantity ?? 1)
                    }
                }

                // IF client couldnt provide stripePriceId for whatever reason(like COD payment or Mongodb Server failure), fetch variantId
                if (i.variantId) {
                    const variant = await prisma.variant.findUnique({
                        where: { id: String(i.variantId) },
                        select: { id: true, name: true, stock: true, price: true, productId: true, stripePriceId: true }
                    })
                    if (!variant) throw new Error(`Invalid variantId: ${i.variantId}`)
                    return {
                        variantId: variant.id,
                        productId: variant.productId,
                        price: variant.price,
                        name: variant.name ?? '',
                        stripePriceId: variant.stripePriceId ?? null,
                        quantity: Number(i.quantity ?? 1)
                    }
                }


                // fallback (least preferred): use client-provided productId/price
                return {
                    variantId: i.variantId ?? null,
                    productId: i.productId ?? null,
                    price: Number(i.price ?? 0),
                    stripePriceId: null,
                    name: i.name ?? "Item",
                    quantity: Number(i.quantity ?? 1)
                }
            })
        )

        // Idempotency key
        const idempotencySource = JSON.stringify({
            userId: session.user.id,
            items: normalized.map((item) => ({
                variantId: item.variantId,
                productId: item.productId,
                qqty: item.quantity,
                pprice: item.price
            })),
            billingAddress,
            shippingAddress
        })
        const idempotencyKey = createHash('sha256').update(idempotencySource).digest('hex')

        // Check existing order
        const existingOrder = await prisma.order.findUnique({
            where: { orderNumber: idempotencyKey },
            include: { items: true }
        })

        let createdOrder = existingOrder
        if (!createdOrder) {
            createdOrder = await reserveAndCreateOrder(normalized, billingAddress, shippingAddress, session?.user?.id, idempotencyKey)
        }

        // Create Stripe Checkout session with idempotency key (Stripe-level)
        const line_items = normalized.map((item) => {
            if (item.stripePriceId) return { price: item.stripePriceId, quantity: item.quantity }
            return {
                price_data: {
                    currency: 'usd',
                    unit_amount: Math.round(Number(item.price ?? 0) * 100),
                    product_data: { name: item.name ?? 'Item', metadata: { productId: item.productId ?? '', variantId: item.variantId ?? '' } },
                },
                quantity: item.quantity,
            }
        })

        const checkoutSession = await stripe.checkout.sessions.create(
            {
                payment_method_types: ['card'],
                mode: 'payment',
                line_items,
                success_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/order/cancel`,
                metadata: {
                    orderId: createdOrder?.id ?? null,
                    userId: session.user.id,
                },
            },
            { idempotencyKey }
        )

        if (!createdOrder?.stripeSessionID) {
            await prisma.order.update({
                where: { id: createdOrder?.id },
                data: { stripeSessionID: checkoutSession.id }
            })
        }

        return NextResponse.json({ sessionId: checkoutSession.id })
    } catch (error) {
        console.error('Stripe error', error)
        const errorMessage =
            typeof error === 'object' && error !== null && 'message' in error
                ? (error as  {message: string}).message
                : 'Failed to create qcheckout session.'
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}