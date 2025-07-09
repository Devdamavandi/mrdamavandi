
'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"


type OrderItem = {
    id: string;
    product: {
        name: string;
    };
    quantity: number;
    priceAtPurchase: number;
};

type Order = {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    total: number;
    items: OrderItem[];
};

 const OrderSuccessPage = () => {
    

    const searchParams = useSearchParams()
    const session_id = searchParams.get('session_id')

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!session_id) return

        const fetchOrder = async (retries = 5) => {
            for (let i = 0; i < retries; i++) {
                const res = await fetch(`/api/order-by-session?session_id=${session_id}`)
                if (res.ok) {
                    const data = await res.json()
                    setOrder(data)
                    setLoading(false)
                    return
                }
                await new Promise(r => setTimeout(r, 3000)) // Wait 1 second before retry
            }
            setLoading(false)
        }

        fetchOrder()
    }, [session_id])

    if (loading) return <div className="p-4">Loading your order...</div>
    if (!order) return <div className="p-4 text-red-500">Order not found.</div>
    
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
  
 export default OrderSuccessPage;