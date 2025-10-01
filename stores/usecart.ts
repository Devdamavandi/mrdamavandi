


import {create} from 'zustand'
import { persist } from 'zustand/middleware'


type CartItem = {
    productId: string
    variantId: string
    name: string
    price: number
    quantity: number
    stock: number
    image: string
}


type CartState = {
    items: CartItem[]
    addItem: (item: CartItem, quantity?: number) => void
    removeItem: (variantId: string) => void
    clearCart: () => void
    increaseQuantity: (variantId: string, stock: number) => void
    decreaseQuantity: (variantId: string) => void
}




export const useCart = create<CartState>()(
    persist(
        (set) => ({
            items: [],



            addItem: (item, quantity = 1) =>
                set((state) => {
                    const existing = state.items.find((i) => i.variantId === item.variantId );
                    if (existing) {
                        // update quantity but dont exceed stock
                        return {
                            items: state.items.map((i) =>
                                i.variantId === item.variantId
                                    ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.stock), }
                                    : i
                            ),
                        };
                    }
                    return { items: [...state.items, {...item, quantity: Math.min(quantity, item.stock)}] };
                }),



            removeItem: (variantId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.variantId !== variantId)
                })),



            clearCart: () => set({ items: [] }),


            
            increaseQuantity: (variantId) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.variantId === variantId && i.quantity < i.stock
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    ),
                })),


                
            decreaseQuantity: (variantId) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.variantId === variantId && i.quantity > 1
                            ? { ...i, quantity: i.quantity - 1 }
                            : i
                    ),
                })),
        }),


        {
            name: "cart-storage", // unique name for storage
        }
    )
);