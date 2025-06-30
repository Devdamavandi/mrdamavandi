


import {create} from 'zustand'



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
    addItem: (item: CartItem) => void
    removeItem: (productId: string, variantId: string) => void
    clearCart: () => void
    increaseQuantity: (productId: string, variantId: string, stock: number) => void
    decreaseQuantity: (productId: string, variantId: string) => void
}




export const useCart = create<CartState>((set) => ({
    items: [],
    addItem: (item) => 
        set((state) => {
            
            const existing = state.items.find((i) => (i.productId === item.productId && i.variantId === item.variantId))
            if (existing) {
                return {
                    items: state.items.map((i) => 
                        (i.productId === item.productId && i.variantId === item.variantId) 
                    ? {...i, quantity: i.quantity + item.quantity} : i 
                    ),
                }
            }
            return { items: [...state.items, item] }
        }),
    removeItem: (productId, variantId) => 
        set((state) => ({
            items: state.items.filter((i) => !(i.productId === productId && i.variantId === variantId))
        })),
    clearCart: () => set({ items: [] }),
    increaseQuantity: (productId, variantId, stock) => 
        set((state) => ({
            items: state.items.map((item) => 
                (item.productId === productId && item.variantId === variantId && item.quantity < stock) ? {...item, quantity: item.quantity + 1} : item
            ),
        })),
    decreaseQuantity: (productId, variantId) => 
        set((state) => ({
            items: state.items.map((item) => 
                (item.productId === productId && item.variantId === variantId && item.quantity > 1) ? {...item, quantity: item.quantity - 1} : item
            ),
        })),
}))