

import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {apiVersion: '2025-05-28.basil'})


export async function POST(req: Request) {
    const session = await auth()

    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items } = await req.json()
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
            unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity,
    }))

    const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${req.headers.get('origin')}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/checkout`,
        metadata: { userId: session.user.id },
    })

    return NextResponse.json({ sessionId: stripeSession.id })
}