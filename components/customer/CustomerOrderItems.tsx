import { OrderItemType } from "./CustomerOrders";


interface CustomOrdersItemsProps {
    items: OrderItemType[]
}



const CustomerOrderItemsComponent = ({ items }: CustomOrdersItemsProps ) => {

    console.log("order items in orderItems Component: ", items)

    return ( 
        <div>
            {items && items.length > 0 && items.map(item => (
                <div key={item.id}>
                    <span>{item.product.name ?? "No name"}</span>
                    <span>{item.variant?.name}</span>
                    <span>{item.total}</span>
                    <span>{item.trackingNumber}</span>
                    <span>{item.carrier}</span>
                    <span>{item.paymentMethod}</span>
                    <span>{item.shippingCost}</span>
                </div>
            )) 
            }
        </div>    
     )
}
 
export default CustomerOrderItemsComponent;