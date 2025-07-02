



'use client'

import { createOrder } from "@/actions/order";
import { useCart } from "@/stores/usecart";
import { useRouter } from "next/navigation";
import {useState} from 'react'
import {loadStripe} from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const CheckoutPage = () => {
    const items = useCart( state => state.items)
    const ClearCart = useCart( state => state.clearCart )
    const router = useRouter()
    
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [addressId, setAddressId] = useState("mock-shipping-address-id")

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shipping = 10
    const discount = 0
    const total = subtotal + shipping

    const handleCheckout = async () => {
        if (paymentMethod === 'COD') {
            // 1. CASH ON DELIVERY (direct DB create)
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
        } else {
            // 2. STRIPE ONLINE PAYMENT
            const res = await fetch("/api/create-checkout-session", {
                method: 'POST',
                body: JSON.stringify({ items }),
                headers: { "Content-Type": "application/json" }
            })

            const { sessionId } = await res.json() 
            const stripe = await stripePromise
            await stripe?.redirectToCheckout({ sessionId })

            ClearCart()  // optional" clear cart only after webhook
        }
    }

    return ( 
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Checkout</h1>

            <div className="mb-4">
                <label className="block mb-1">Choose Payment Method:</label>
                <select
                    value={paymentMethod}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentMethod(e.target.value as 'COD' | 'CARD')}
                    className="border rounded w-full p-2"
                >
                    <option value="COD">Pay on Delivery</option>
                    <option value="CARD">Pay Online (Credit Card) </option>
                </select>
            </div>

            <div className="mb-2">Subtotal: ${subtotal}</div>
            <div className="mb-2">Shipping: ${shipping}</div>
            <div className="mb-4 font-bold">Total: ${total}</div>
            
            <button onClick={handleCheckout} className="w-full bg-black text-white py-2 rounded">
                {paymentMethod === 'COD' ? 'Place Order' : 'Pay with Card'}
            </button>
        </div>
     );
}
 
export default CheckoutPage;