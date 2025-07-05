import Stripe from "stripe"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"


export const config = { api: { bodyParser: false } }
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' })

export async function POST(req:Request) {

    const buf = await req.arrayBuffer()
    const sig = req.headers.get('stripe-signature')
    let event: Stripe.Event | undefined

    if (!sig) {
        return NextResponse.json({ error: "Missing Stripe signature header" }, { status: 400 });
    }

    try {
        event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })        
    }

    if (event.type === 'checkout.session.completed') {
        const sess = event.data.object as Stripe.Checkout.Session

        // Retrieve line items
        const stripeSession = await stripe.checkout.sessions.retrieve(sess.id, { expand: ['line_items'] })

        const items = (stripeSession.line_items?.data || []).map((li) => ({
            productId: li.price?.product?.toString() || '',
            variantId: li.price?.lookup_key || undefined,
            quantity: li.quantity!,
            priceAtPurchase: (li.price?.unit_amount || 0) / 100,
        }))

        // Create order in DB
        const userId = sess.metadata?.userId;
        if (!userId) {
            return NextResponse.json({ error: "Missing userId in session metadata" }, { status: 400 });
        }
        await prisma.order.create({
            data: {
                orderNumber: sess.id,
                userId: userId,
                billingAddressId: '', // future: capture addresses
                shippingAddressId: '',
                subtotal: items.reduce((a, i) => a + i.priceAtPurchase * i.quantity, 0),
                tax: 0,
                shippingCost: 0,
                discount: 0,
                total: sess.amount_total! / 100,
                paymentMethod: 'CREDIT_CARD',
                paymentStatus: 'PAID',
                items: { create: items.map(i => ({ ...i })) },
            },
        })
    }

    return NextResponse.json({ received: true })
}