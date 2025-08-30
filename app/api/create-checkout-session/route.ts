

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


export async function POST(req: Request) {

    try {
        const session = await auth()

    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items, billingAddress, shippingAddress } = await req.json()
    if (!Array.isArray(items)) return NextResponse.json({ error: 'Invalid items' } , { status: 400 })

    interface CheckoutItem {
        name: string;
        productId: string;
        variantId: string;
        price: number;
        quantity: number;
    }

    const line_items = items.map((i: CheckoutItem) => ({
        price_data: {
            currency: 'usd',
            product_data: { name: i.name, metadata: { productId: i.productId, variantId: i.variantId } },
            unit_amount: Math.round(Number(i.price * 100)),
        },
        quantity: Number(i.quantity),
    }))

    const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/checkout?cancelled=true`,
        metadata: { 
            userId: session.user.id,
            billingAddress: JSON.stringify(billingAddress),
            shippingAddress: JSON.stringify(shippingAddress)
         },
    })

    const existingOrder= await prisma.order.findUnique({
        where: { stripeSessionID: stripeSession.id }
    })

    // Create PENDING order immediately
    if (!existingOrder) {
        await prisma.order.create({
            data: {
                userId: session.user.id,
                stripeSessionID: stripeSession.id,
                subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
                total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
                paymentStatus: "PENDING",
                orderNumber: `ORD-${Date.now()}`, // Example order number
                tax: 0, // Set appropriate tax value
                shippingCost: 0, // Set appropriate shipping cost
                paymentMethod: 'CREDIT_CARD', // Set appropriate payment method
                items: {
                    create: items.map(i => ({
                        quantity: i.quantity,
                        priceAtPurchase: i.price,
                        product: { connect: { id: i.productId } }
                    }))
                }
            }
        })
    }

    return NextResponse.json({ sessionId: stripeSession.id })
    } catch (error) {
        console.error("Stripe error: ", error)
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : "Failed to create checkout session.";
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
    
}