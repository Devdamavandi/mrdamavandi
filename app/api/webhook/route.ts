import Stripe from "stripe"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

type StripeMetadata = {
    userId: string
    billingAddress: string
    shippingAddress: string
}

type parsedAddress = {
    street: string
    city: string
    state: string
    country: string
    zipCode?: string
}

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
        const metadata = sess.metadata as StripeMetadata
        
        const billingAddress = JSON.parse(metadata.billingAddress) as parsedAddress
        const shippingAddress = JSON.parse(metadata.shippingAddress) as parsedAddress


        // Retrieve line items
        const line_items = await stripe.checkout.sessions.listLineItems(sess.id, { expand: ['data.price.product'] })

        const items = line_items.data.map((li) => ({
            productId: li.price?.product.toString() || '',
            variantId: li.price?.lookup_key || '',
            quantity: li.quantity || 1,
            priceAtPurchase: (li.price?.unit_amount || 0) / 100,
        }))

        // Create order in DB
        const userId = sess.metadata?.userId;
        if (!userId) {
            return NextResponse.json({ error: "Missing userId in session metadata" }, { status: 400 });
        }

        // Create billing Address
        const billing = await prisma.address.create({
            data: {
                userId,
                street: billingAddress.street,
                city: billingAddress.city,
                state: billingAddress.state,
                country: billingAddress.country,
                zipCode: billingAddress.zipCode || '',
            }
        })

        const shipping = await prisma.address.create({
            data: {
                userId,
                street: shippingAddress.street,
                city: shippingAddress.city,
                state: shippingAddress.state,
                country: shippingAddress.country,
                zipCode: shippingAddress.zipCode || '',
            }
        })

        await prisma.order.create({
            data: {
                orderNumber: sess.id,
                userId: userId,
                subtotal: items.reduce((a, i) => a + i.priceAtPurchase * i.quantity, 0),
                tax: 0,
                shippingCost: 0,
                discount: 0,
                total: sess.amount_total! / 100,
                paymentMethod: 'CREDIT_CARD',
                paymentStatus: 'PAID',
                items: { create: items.map(i => ({ ...i })) },
                billingAddressId: billing.id,
                shippingAddressId: shipping.id
            },
        })
    }
    
    console.log("🔔 Stripe Webhook triggered:", event.type)
    return NextResponse.json({ received: true })
}
