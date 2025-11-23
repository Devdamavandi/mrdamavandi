
'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useCart } from "@/stores/usecart"
import { roboto } from "@/lib/fonts";
import Image from "next/image";


type OrderItem = {
    id: string;
    product: {
        name: string;
        image: string
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

    const ClearAll = useCart((state) => state.clearCart)

    useEffect(() => {

        const fetchOrder = async (retries = 5) => {
            let res
            for (let i = 0; i < retries; i++) {
                if (session_id) {
                    res = await fetch(`/api/order-by-session?session_id=${session_id}`)
                } else {
                    res = await fetch('/api/order-latest')
                }
                
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
        ClearAll()
    }, [ClearAll, session_id])

    if (loading) return <div className="p-4">Loading your order...</div>
    if (!order) return <div className="p-4 text-red-500">Order not found.</div>
    
    return (
        <div className={`h-screen flex flex-col items-center justify-center`}>
            <h1 className={`text-3xl mb-4 text-teal-500 font-bold ${roboto.className}`}>🎉 Order Successful</h1>
            <p className="mb-4 text-slate-600">{`Thank you for your purchase! Here's your order summary:`}</p>

            <div className={`mb-4 shadow p-4 rounded ${roboto.className}`}>
                <p className="text-slate-600 font-light"><strong>Order Number:</strong> {order.orderNumber}</p>
                <p className="text-slate-600 font-light"><strong>Status:</strong> {order.status}</p>
                <p className="text-slate-600 font-light"><strong>Payment:</strong> {order.paymentStatus} ({order.paymentMethod})</p>
                <p className="text-slate-600 font-light"><strong>Total:</strong> {order.total}</p>
            </div>

            <h2 className="font-semibold mb-2">Items:</h2>
            <ul className="mb-4">
                {order.items.map(item => (
                    <li key={item.id} className="sm:w-lg flex items-center">
                        <span>{item.product.name} x {item.quantity} - ${item.priceAtPurchase}</span>
                        <Image 
                            src={item?.product?.image || "/default-image.jpg"}
                            alt={item.product.name}
                            width={64}
                            height={64}
                        />
                    </li>
                ))}
            </ul>

            <p className="text-sm text-gray-500">{`We'll notify you when it ships.`}</p>
        </div>
    )
 }
  
 export default OrderSuccessPage;