import { getAllOrders } from "@/actions/order";
import AdminOrdersPageContent from "@/components/AdminOrdersPageContent";



export default async function AdminOrdersPage() {
    const ordersRaw = await getAllOrders();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orders = ordersRaw.map((order: any) => ({
        ...order,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: order.items.map((item: any) => ({
            ...item,
            product: {
                ...item.product,
                whatsInTheBox: typeof item.product.whatsInTheBox === "object" && item.product.whatsInTheBox !== null
                    ? item.product.whatsInTheBox
                    : { html: "", text: "", images: [] }
            }
        })),
    }));

    return (
        <AdminOrdersPageContent orders={orders}/>
    )
} 