


'use client'



import { useCart } from "@/stores/usecart"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import {loadStripe} from '@stripe/stripe-js'
import { useSession } from "next-auth/react"


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)



const CheckoutPageContent = () => {
     const { data: session, status } = useSession()

    const items = useCart( state => state.items)
    const ClearCart = useCart( state => state.clearCart )
    const router = useRouter()
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [addressId, setAddressId] = useState("mock-shipping-address-id")

    const searchParams = useSearchParams()
    const cancelled = searchParams.get('cancelled')
    
    
    // To Check if user has logged in or not
    if (status === 'loading') return <div>Loading...</div>
    if (!session?.user) {
        if (typeof window !== 'undefined') window.location.href = "/auth/login"
        return null
    }



    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const shipping = 10
    const discount = 0
    const total = subtotal + shipping

    const handleCheckout = async () => {
        if (paymentMethod === 'COD') {
            // 1. CASH ON DELIVERY (direct DB create)
            await fetch('/api/order-before-payment' , {
                method: 'POST',
                body: JSON.stringify({
                    items: items.map((i) => ({
                    productId: i.productId,
                    variantId: i.variantId,
                    quantity: i.quantity,
                    priceAtPurchase: i.price,
                    name: i.name
                })),
                billingAddressId: addressId,
                shippingAddressId: addressId,
                paymentMethod: "COD",
                shippingCost: shipping,
                discount,
                }),
                headers: { "Content-Type": "application/json" }
            })
    
            ClearCart()
            router.push('/order-success')
        } else {
            // 2. STRIPE ONLINE PAYMENT
            const res = await fetch("/api/create-checkout-session", {
                method: 'POST',
                body: JSON.stringify({ 
                    items: items.map(i => ({
                        name: i.name,
                        productId: i.productId,
                        variantId: i.variantId,
                        price: i.price,
                        quantity: i.quantity
                    }))
                 }),
                headers: { "Content-Type": "application/json" }
            })

            let sessionId = ""
            if (res.ok) {
                const data = await res.json()
                sessionId = data.sessionId
            } else {
                const error = await res.json().catch(() => ({}))
                alert(error?.error || "Payment error. PLease try again.")
                return
            }
            const stripe = await stripePromise
            await stripe?.redirectToCheckout({ sessionId })

            ClearCart()  // optional" clear cart only after webhook
        }
    }

    return ( 
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Checkout</h1>

            {cancelled === 'true' && (
                <div className="mb-4 text-red-500">
                    Payment was cancelled. Please try again.
                </div>
            )}

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
 
export default CheckoutPageContent;