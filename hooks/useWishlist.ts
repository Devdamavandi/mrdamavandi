

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"


export const useCreateWishlist = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productID, userID }: { productID: string, userID: string }) => {
            const res = await axios.post('/api/wishlist', { productID, userID })
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist']})
        }
    })
}

export const useDeleteWishlist = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({userID, productID} : {userID: string, productID: string}) => {
            const res = await axios.delete('/api/wishlist', {
                data: { userID, productID }
            })
            return res.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist']})
        }
    })
}