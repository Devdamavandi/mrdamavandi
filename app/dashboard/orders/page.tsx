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
                        <form action={`/api/orders/${order.id}/update-status`} method="POST">
                            <select name="status" defaultValue={order.status} className="border rounded  px-2 py-1">
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELED">Canceled</option>
                                <option value="RETURNED">Returned</option>
                            </select>
                            <button type="submit" className="ml-2 px-2 py-1 bg-black text-white rounded text-sm">Update</button>
                        </form>
                        <form action={`/api/orders/${order.id}/tracking`} method="POST" className="mt-2">
                            <input name="carrier" placeholder="Carrier" className="border p-1 mr-2" />
                            <input name="trackingNumber" placeholder="Tracking #" className="border p-1 mr-2" />
                            <button type="submit" className="textsm bg-gray-800 text-white px-2 py-1 rounded">Save</button>
                        </form>
                    </div>
                ))}
                </div>
            ))}
        </div>
    )
} 