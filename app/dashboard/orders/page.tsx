import { getAllOrders } from "@/actions/order";
import { auth } from "@/auth";
import AdminOrdersPageContent from "@/components/AdminOrdersPageContent";
import { redirect } from "next/navigation";



export default async function AdminOrdersPage() {
    const ordersRaw = await getAllOrders();
    const session = await auth()

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
        <>
        {session?.user?.role === 'ADMIN' ? <AdminOrdersPageContent orders={orders} /> : redirect('/dashboard') }
        </>
    )
} 