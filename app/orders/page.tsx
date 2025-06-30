


import { getUserOrders } from "@/actions/order";


export default async function OrdersPage() {

    const orders = await getUserOrders()
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Your Orders</h1>
            {orders.map((order) => (
                <div key={order.id} className="border rounded p-2 mb-4">
                    <div>Order: #{order.orderNumber}</div>
                    <div>Status: {order.status}</div>
                    <div>Total: ${order.total}</div>
                </div>
            ))}
        </div>
    )
}