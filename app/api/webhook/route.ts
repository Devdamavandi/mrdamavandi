import Stripe from "stripe"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"



export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


export async function POST(req:Request) {
    
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')
    
    
    
    if (!sig) {
        return NextResponse.json({ error: "Missing Stripe signature header" }, { status: 400 });
    }
    
    console.log('webhook endpoint called')
    let event: Stripe.Event | undefined
    try {
         event = stripe.webhooks.constructEvent(
        body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET!
    )
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        console.error("Stripe signature verification failed: ", message)
        return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 })        
    }
    
    if (event.type === 'checkout.session.completed') {
        const sess = event.data.object as Stripe.Checkout.Session
        console.log('chekout.session.completed received, session id: ', sess.id)
        
    

        
        try {
            // Update existing order instead of creating a new one
            const updatedOrder = await prisma.order.update({
                where: { stripeSessionID: sess.id },
                data: { 
                    paymentStatus: 'PAID',
                    paymentMethod: 'CREDIT_CARD',
                    total: (sess.amount_total ?? 0) / 100,
                },
                include: { items: { select: { productId: true, quantity: true, priceAtPurchase:true } } },
            })


            console.log('Order updated to PAID: ', updatedOrder.id)


            // Decrement Stock
            if (updatedOrder.items.length > 0) {
                // Fetch all product revenues first
                const productRevenues = await prisma.product.findMany({
                    where: {
                        id: {
                            in: updatedOrder.items.map(item => item.productId)
                        }
                    },
                    select: {
                        id: true,
                        revenue: true
                    }
                });

                await prisma.$transaction(
                    updatedOrder.items.map((item) => {
                        const product = productRevenues.find(p => p.id === item.productId);
                        const newRevenue = (product?.revenue ?? 0) + item.priceAtPurchase * item.quantity;
                        return prisma.product.update({
                            where: { id: item.productId },
                            data: { 
                                stock: { decrement: item.quantity },
                                revenue: newRevenue
                            }
                        });
                    })
                );
                console.log('Product stock decremented for order: ', updatedOrder.id)
            } else {
                console.warn('No items found for order, stock not decremented')
            }
        } catch (err) {
            console.error('Order udate failed: ', err)
            return NextResponse.json({ error: 'order update failed' }, { status: 500 })
        }
    }
    
    console.log("🔔 Stripe Webhook triggered:", event.type)
    return NextResponse.json({ received: true })
}
