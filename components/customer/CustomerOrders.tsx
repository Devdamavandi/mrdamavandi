import { poppins } from "@/lib/fonts"
import axios from "axios"
import { useEffect, useState } from "react"

interface OrderType {
    id: string
    orderNumber: string
    paymentStatus: string
    status: string
}

const CustomerOrdersPage = ({ userId }: { userId?: string }) => {

    const [orders, setOrders] = useState([])

    useEffect(() => {
        const fetchCustomerOrders = async () => {
            if (!userId) return
            const res = await axios.get(`/api/orders/customer?userId=${userId}`)
            if (!res) throw new Error('Couldnt fetch Customer Orders from the Backend')
            setOrders(res.data)
        }
        fetchCustomerOrders()
    }, [userId])

    console.log('Orders = ', orders)

    return (
        <div>
            <h1>Orders</h1>
            {orders && orders.map((order: OrderType) => (
                <div key={order.id} className={`flex flex-col ${poppins.className}`}>
                    <span>Order number:{order.orderNumber}</span>
                    <span>Payment status: {order.paymentStatus}</span>
                    <span>Status: {order.status}</span>
                </div>
            ))}
        </div>
    )
}


export default CustomerOrdersPage