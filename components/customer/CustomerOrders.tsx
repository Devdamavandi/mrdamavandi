import axios from "axios"
import { useEffect, useState } from "react"
import CustomerOrderItemsComponent from "./CustomerOrderItems"
import { LucideMoveLeft } from 'lucide-react'

export type OrderItemType = {
    id: string
    name: string
    shippingCost: number
    total: number
    trackingNumber: string
    paymentMethod: string
    carrier: string
    _count: number
        product: {
        name: string
    }
    variant: {
        name: string
        sku: string
        price: number
        stock :number
        attributes: JSON
        discount: number
    }
}

interface orderProductVariantProp {
    test: string
}

interface OrderType {
    id: string
    orderNumber: string
    paymentStatus: string
    items: OrderItemType[]
    status: string
    createdAt: string
    product?: orderProductVariantProp
    variant?: orderProductVariantProp 
}

const CustomerOrdersPage = ({ userId }: { userId?: string }) => {

    const [orders, setOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)

    useEffect(() => {
        const fetchCustomerOrders = async () => {
            if (!userId) return
            const res = await axios.get(`/api/orders/customer?userId=${userId}`)
            if (!res) throw new Error('Couldnt fetch Customer Orders from the Backend')
            setOrders(res.data)
        }
        fetchCustomerOrders()
    }, [userId])


    if (selectedOrder) {
        // Show order items for the selected user
        return (
            <div>
                <button className="mt-12 mb-4 px-4" onClick={() => setSelectedOrder(null)}>
                    <LucideMoveLeft className="cursor-pointer hover:text-slate-400" />
                </button>
                <h2 className="mb-2 ml-12">Items for Order <span className="pl-4"># {selectedOrder.orderNumber}</span></h2>
                    <CustomerOrderItemsComponent items={selectedOrder.items} />
            </div>
        )
    }

    console.log('Orders = ', orders)

    return (
        <div>
            <table className="mt-12">
                <thead>
                    <tr className="text-left">
                        <th className="w-6 bg-transparent"></th>
                        <th className="pr-4 py-2">Order Number</th>
                        <th className="px-4 py-2">Payment Status</th>
                        <th className="px-4 py-2">Orders</th>
                        <th className="px-4 py-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {orders && orders.map((order: OrderType) => (
                        <tr key={order.id} className="text-left text-sm">
                            <td className="bg-transparent w-6"></td>
                            <td className="w-50 whitespace-normal break-all pr-4 py-2 border-b border-b-slate-300">{order.orderNumber}</td>
                            <td className="px-4 border-b border-b-slate-300">{order.paymentStatus}</td>
                            <td className="px-4 border-b border-b-slate-300">
                                <button className="text-blue-400 hover:text-blue-600 underline cursor-pointer" onClick={() => {
                                    setSelectedOrder(order)
                                }}>
                                    view Items
                                </button>
                            </td>
                            <td className="px-4 border-b border-b-slate-300">{order.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}


export default CustomerOrdersPage