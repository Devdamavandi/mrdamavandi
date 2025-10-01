import Stripe from "stripe"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"



export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


export async function POST(req:Request) {
    
    const body = await req.text()
    const sig = (req.headers.get('stripe-signature') ?? '')
    
    
    
    if (!sig) {
        return NextResponse.json({ error: "Missing Stripe signature header" }, { status: 400 });
    }
    
    console.log('webhook endpoint called')
    let event: Stripe.Event | undefined
    try {
        event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error("Stripe signature verification failed: ", message)
        return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })        
    }
    
    switch (event.type) {
        case "checkout.session.completed": {
            const sess = event.data.object as Stripe.Checkout.Session
            await prisma.order.update({
                where: { stripeSessionID: sess.id },
                data: {
                    paymentStatus: "PAID",
                    total: (sess.amount_total ?? 0) / 100
                },
            })
            break
        }

        case "checkout.session.expired":
        case "checkout.session.async_payment_failed":
        case "payment_intent.payment_failed": {
            const sess = event.data.object as Stripe.Checkout.Session
            const order = await prisma.order.findUnique({
                where: { stripeSessionID: sess.id },
                include: { items: true }
            })
            if (order) {
                // release reserved stock
                await prisma.$transaction(
                    order.items.map((item) => 
                        prisma.variant.update({
                            where: { id: item.variantId! },
                            data: { stock: { increment: item.quantity } }
                        })
                    )
                )
                await prisma.order.update({
                    where: { id: order.id },
                    data: { paymentStatus: "FAILED" }
                })
            }
            break
        }
    }
    
    return NextResponse.json({ received: true })
}
