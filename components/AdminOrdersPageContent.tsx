


import TopNavigationNav from "@/components/dashboard/top-nav";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { OrderSchema } from "@/types/zod";
import { poppins } from "@/lib/fonts";

interface OrdersType {
    orders: OrderSchema[]
}

const AdminOrdersPageContent = ({orders} : OrdersType) => {
    return ( 
        <div>
            <TopNavigationNav/>
            <div>
                <h1 className="text-xl font-bold mt-8 mb-2">All Orders</h1>
                {/* Search Box */}
                <input 
                    type="text"
                    className={`${poppins.className} p-2 w-1/3`}
                 />
            </div>
            {orders && orders.length > 0 ? (
                orders.map((order) => (
                <div key={order.id} className="border border-gray-200 shadow-md pt-4 pb-2 px-3 rounded mb-8">
                    <div className="text-sm">
                        <div><strong>Order Number</strong>: {order.orderNumber}</div>
                        <span><strong>Customer Email</strong>: {order.user ? order.user.email : "N/A"}</span>
                        <div><strong>status</strong>: {order.status}</div>
                        <div><strong>Total</strong>: ${order.total}</div>
                        <div><strong>Payment Status</strong>: ${order.paymentStatus}</div>
                    </div>
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>purchased products</AccordionTrigger>
                            <AccordionContent>
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex flex-col">
                                        <span><strong className="text-sm">Title</strong>: {item.product?.name} * {item.quantity}</span>
                                        <form action={`/api/orders/${order.id}/update-status`} method="POST">
                                            <select name="status" defaultValue={order.status} className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                                                <option value="PROCESSING">processing</option>
                                                <option value="SHIPPED">shipped</option>
                                                <option value="DELIVERED">delivered</option>
                                                <option value="CANCELED">canceled</option>
                                                <option value="RETURNED">returned</option>
                                            </select>
                                            <button type="submit" className="ml-2 px-2 py-1 mt-4 bg-emerald-400 text-white rounded text-sm hover:bg-emerald-500 cursor-pointer">update</button>
                                        </form>
                                        <form action={`/api/orders/${order.id}/tracking`} method="POST" className="mt-2">
                                            <input name="carrier" placeholder="carrier" className="border border-gray-400 rounded px-1 py-2 mr-2 text-sm text-gray-600" />
                                            <input name="trackingNumber" placeholder="tracking #" className="border border-gray-400 rounded px-1 py-2 mr-2 text-sm text-gray-600" />
                                            <button type="submit" className="textsm bg-gray-200 text-gray-700 px-8 py-1.5 rounded shadow hover:bg-gray-300 cursor-pointer">save</button>
                                        </form>
                                    </div>  
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            ))
            ) : (
                <p>No Orders Exist Now!</p>
            )}
        </div>
     )
}
 
export default AdminOrdersPageContent;