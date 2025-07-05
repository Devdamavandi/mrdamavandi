import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"


export default async function OrderSuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {

    const sessionId = await searchParams.session_id
    if (!sessionId) redirect('/')

    // const stripeSession = await stripe.checkout.sessions.retrieve(sessionId,{
    //     expand: ['line_items']
    // })

    const order = await prisma.order.findFirst({
        where: { orderNumber: sessionId },
        include: {
            items: {
                include: { product: true, variant: true }
            }
        }
    })

    if (!order) return <div className="p-6">Order Not Found!</div>

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">🎉 Order Successful</h1>
            <p className="mb-4">{`Thank you for your purchase! Here's your order summary:`}</p>

            <div className="mb-4 border p-4 rounded">
                <p><strong>Order Number:</strong> {order.orderNumber}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Payment:</strong> {order.paymentStatus} ({order.paymentMethod})</p>
                <p><strong>Total:</strong> {order.total}</p>
            </div>

            <h2 className="font-semibold mb-2">Items:</h2>
            <ul className="mb-4">
                {order.items.map(item => (
                    <li key={item.id}>
                        {item.product.name} x {item.quantity} - ${item.priceAtPurchase}
                    </li>
                ))}
            </ul>

            <p className="text-sm text-gray-500">{`We'll notify you when it ships.`}</p>
        </div>
    )
}