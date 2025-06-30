



'use client'

import { createOrder } from "@/actions/order";
import { useCart } from "@/stores/usecart";
import { useRouter } from "next/navigation";
import {useState} from 'react'

const CheckoutPage = () => {
    const items = useCart( state => state.items)
    const ClearCart = useCart( state => state.clearCart )
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [addressId, setAddressId] = useState("mock-shipping-address-id")
    const router = useRouter()
    

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shipping = 10
    const discount = 0
    const total = subtotal + shipping

    const handleCheckout = async () => {
        await createOrder({
            items: items.map((i) => ({
                productId: i.productId,
                variantId: i.variantId,
                quantity: i.quantity,
                priceAtPurchase: i.price
            })),
            billingAddressId: addressId,
            shippingAddressId: addressId,
            paymentMethod: "COD",
            shippingCost: shipping,
            discount,
        })

        ClearCart()
        router.push('/order-success')
    }

    return ( 
        <div>
            <h1 className="text-xl font-bold mb-4">Checkout</h1>
            <div className="mb-2">Items: {items.length}</div>
            <div className="mb-2">Subtotal: ${subtotal}</div>
            <div className="mb-2">Shipping: ${shipping}</div>
            <div className="mb-4 font-bold">Total: ${total}</div>
            <button onClick={handleCheckout} className="w-full bg-black text-white py-2 riunded">
                Place Order
            </button>
        </div>
     );
}
 
export default CheckoutPage;