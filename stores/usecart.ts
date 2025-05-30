


import {create} from 'zustand'



type CartItem = {
    productId: string
    name: string
    price: number
    quantity: number
    stock: number
    image: string
}


type CartState = {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (productId: string) => void
    clearCart: () => void
    increaseQuantity: (productId: string, stock: number) => void
    decreaseQuantity: (productId: string) => void
}




export const useCart = create<CartState>((set) => ({
    items: [],
    addItem: (item) => 
        set((state) => {
            
            const existing = state.items.find((i) => i.productId === item.productId)
            if (existing) {
                return {
                    items: state.items.map((i) => 
                        i.productId === item.productId ? {...i, quantity: i.quantity + item.quantity} : i 
                    ),
                }
            }
            return { items: [...state.items, item] }
        }),
    removeItem: (productId) => 
        set((state) => ({
            items: state.items.filter((i) => i.productId !== productId)
        })),
    clearCart: () => set({ items: [] }),
    increaseQuantity: (productId: string, stock: number) => 
        set((state) => ({
            items: state.items.map((item) => 
                (item.productId === productId && item.quantity < stock) ? {...item, quantity: item.quantity + 1} : item
            ),
        })),
    decreaseQuantity: (productId: string) => 
        set((state) => ({
            items: state.items.map((item) => 
                (item.productId === productId && item.quantity > 1) ? {...item, quantity: item.quantity - 1} : item
            ),
        })),
}))