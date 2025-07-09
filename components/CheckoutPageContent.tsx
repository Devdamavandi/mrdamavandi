


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
     
    const [billingAddress, setBillingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode:'',
        country: 'US'
    })
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode:'',
        country: 'US'
    })
   

    const [fieldErrors, setFieldErrors] = useState({
        billingStreet: false,
        billingCity: false,
        billingState: false,
        billingCountry: false,
        shippingStreet: false,
        shippingCity: false,
        shippingState: false,
        shippingCountry: false
    })

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
                    name: i.name,
                })),
                billingAddress,
                shippingAddress,
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

    const handleValidateAndCheckout = () => {
        
        const errors = {
            billingStreet: billingAddress.street.trim() === '',
            billingCity: billingAddress.city.trim() === '',
            billingState: billingAddress.state.trim() === '',
            billingCountry: billingAddress.country.trim() === '',
            shippingStreet: shippingAddress.street.trim() === '',
            shippingCity: shippingAddress.city.trim() === '',
            shippingState: shippingAddress.state.trim() === '',
            shippingCountry: shippingAddress.state.trim() === ''
        }

        setFieldErrors(errors)

        const hasError = Object.values(errors).some(Boolean)
        if (hasError) return
        
        handleCheckout()
    }
  

    return ( 
        <div className="grid justify-start items-center">
            <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-4 place-content-center w-full">
                <h1 className="text-xl font-bold mb-4">Checkout</h1>
                {cancelled === 'true' && (
                    <div className="mb-4 text-red-500">
                        Payment was cancelled. Please try again.
                    </div>
                )}
                <div className="mb-4">
                    <div className="flex flex-col gap-1 mb-4">
                        {/* Billing Address */}
                        <div>
                            <h3 className="font-semibold mt-4 pb-2">Billing Address</h3>
                            <div>
                                <input type="text" placeholder="Street" className="border border-gray-300 p-2 rounded-md w-full text-sm"
                                    onChange={e => setBillingAddress(prev => ({...prev, street: e.target.value}))}
                                    value={billingAddress.street}
                                />
                                {fieldErrors.billingStreet && <span className="text-sm text-red-500">please fill the street</span>}
                            </div>
                            {/* City - State -Country */}
                            <div className="flex gap-2 w-full mt-2">
                                <div>
                                    <input type="text" placeholder="City" className="border border-gray-300 p-2 rounded-md w-full text-sm"
                                        onChange={e => setBillingAddress(prev => ({...prev, city: e.target.value}))}
                                    />
                                    {fieldErrors.billingCity && <span className="text-sm text-red-500">please fill the city</span>}
                                </div>
                                <div>
                                    <input type="text" placeholder="State" className="border border-gray-300 p-2 rounded-md w-full text-sm"
                                        onChange={e => setBillingAddress(prev => ({...prev, state: e.target.value}))}
                                        value={billingAddress.state}
                                    />
                                    {fieldErrors.billingState && <span className="text-sm text-red-500">please fill the state</span>}
                                </div>
                                <div>
                                    <input type="text" placeholder="Country" className="border border-gray-300 p-2 rounded-md w-full text-sm"
                                        onChange={e => setBillingAddress(prev => ({...prev, country: e.target.value}))}
                                        value={billingAddress.country}
                                    />
                                    {fieldErrors.billingCountry && <span className="text-sm text-red-500">please fill the country</span>}
                                </div>
                            </div>
                        </div>
                        {/* Shipping Address */}
                        <div>
                            <h3 className="font-semibold mt-4 pb-2">Shipping Address</h3>
                            <input type="text" placeholder="Street" className="border border-gray-300 p-2 rounded-md w-full text-sm"
                                onChange={(e) => {
                                    const value = e.target.value
                                    setShippingAddress(prev => ({...prev, street: value}))
                                }}
                                value={shippingAddress.street}
                            />
                            {fieldErrors.shippingStreet && <span className="text-sm text-red-500">please fill street</span>}
                            {/* City - State -Country */}
                            <div className="flex gap-2 w-full mt-2">
                                <div className="w-full">
                                    <input type="text" placeholder="City" className="border border-gray-300 p-2 rounded-md w-full text-sm"
                                        onChange={e => {
                                            const value = e.target.value
                                            setShippingAddress(prev => ({...prev, city: value}))
                                        }}
                                        value={shippingAddress.city}
                                    />
                                    <p>{fieldErrors.shippingCity && <span className="text-sm text-red-500">please fill city</span>}</p>
                                </div>

                                <div className="w-full">
                                    <input type="text" placeholder="State" className="border border-gray-300 p-2 rounded-md w-full text-sm"
                                        onChange={e => {
                                            const value = e.target.value
                                            setShippingAddress(prev => ({...prev, state: value}))
                                        }}
                                        value={shippingAddress.state}
                                        />
                                        <p>{fieldErrors.shippingState && <span className="text-sm text-red-500">please fill state</span>}</p>
                                </div>
                                
                                <div className="w-full">
                                    <input type="text" placeholder="Country" className="border border-gray-300 p-2 rounded-md w-full text-sm"
                                        onChange={e => {
                                            const value = e.target.value
                                            setShippingAddress(prev => ({...prev, country: value}))
                                        }}
                                        value={shippingAddress.country}
                                        />
                                        <p>{fieldErrors.shippingCountry && <span className="text-sm text-red-500">please fill country</span>}</p>
                                </div>
                            </div>
                        </div>
                      
                    </div>
            
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
            
                <button onClick={handleValidateAndCheckout} className="w-full bg-black text-white py-2 rounded">
                    {paymentMethod === 'COD' ? 'Place Order' : 'Pay with Card'}
                </button>
            </div>
        </div>
     );
}
 
export default CheckoutPageContent;