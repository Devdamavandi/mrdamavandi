import { getAllOrders } from "@/actions/order";




export default async function AdminOrdersPage() {
    const orders = await getAllOrders()

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">All Orders</h1>
            {orders.map((order) => (
                <div key={order.id} className="border rounded p-2 mb-4">
                    <div>#{order.orderNumber} - {order?.user.email}</div>
                    <div>Status: {order.status}</div>
                    <div>Total: ${order.total}</div>
                {order.items.map((item) => (
                    <div key={item.id}>
                        - {item.product.name} * {item.quantity}
                    </div>
                ))}
                </div>
            ))}
        </div>
    )
} 