

'use client'

import { DealSchema, ProductFormValues } from "@/types/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from 'axios'
import { useRouter } from "next/navigation"


const apiClient = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/products/api`,
    headers: {'Content-Type': 'application/json'}
})


/* -------------------------------------------------------------------------------------------------------------------- */
// GET ALL PRODUCTS


// fetch all products using the api server
const getProducts = async(): Promise<ProductFormValues[]> => {

    const res = await apiClient.get('/', {
        params: {includeCategory: true}
    })

    if (!res) throw new Error('No products to fetch')

    return res.data
}


// fetch all products react-query function
export const useProducts = () => {
    return useQuery<ProductFormValues[]>({
        queryKey: ['products'],
        queryFn: getProducts,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3, // Retry 3 times before failing
        retryDelay: 1000 // Wait 1 second between retries
    })
}



/* -------------------------------------------------------------------------------------------------------------------- */
// GET SINGLE PRODUCT BY ID


// fetch Single product using the api server
const getSingleProduct = async (id: string): Promise<ProductFormValues> => {

    const res = await apiClient.get(`/${id}`)
    return res.data
}


// fetch single Product react-query Function
export const useSingleProduct = (id: string) => {

    return useQuery<ProductFormValues>({
        queryKey: ['products', id],
        queryFn: () => getSingleProduct(id),
        enabled: !!id  // Only fetvh if ID exists
    })
}




/* -------------------------------------------------------------------------------------------------------------------- */
// CREATE PRODUCT


// Create Product using the api Server
const createProduct = async (product: Omit<ProductFormValues, 'id'>) : Promise<ProductFormValues> => {
    try {
        const res = await apiClient.post('/', product)
        return res.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios Error: ', error.response?.data)
            throw new Error(error.response?.data.error || 'Failed to create product')
        } else {
            console.error('Unexpected error: ', error)
            throw new Error('Unexpected error occurred!!')
        }
    }
}


// Create product react-query function
export const useCreateProduct = () => {

    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: createProduct,
        onMutate: async () => {
            // cancel any outgoing refetches
            await queryClient.cancelQueries({queryKey: ['products']})

            // Snapshot the previous value
            const previousProducts = queryClient.getQueryData<ProductFormValues[]>(['products']) || []

            return {previousProducts}
        },
        onError: (err, newProduct, context) => {
            // Rollback to the previous value on error
            queryClient.setQueryData(['products'], context?.previousProducts)
        },

        onSuccess: (newProduct) => {
            
            // Replace the optimistic product with the real one
            queryClient.setQueryData<ProductFormValues[]>(['products'], (old = []) => [
                ...old,
                newProduct
            ])

            router.push('/dashboard/products')
        },
        onSettled: () => {
            queryClient.invalidateQueries({queryKey: ['products']})
        }
    })
}




/* -------------------------------------------------------------------------------------------------------------------- */
// UPDATE PRODUCT


// Update Single product using api server
const updateProduct = async (product: ProductFormValues): Promise<ProductFormValues> => {

    if (!product.id) throw new Error("Product ID is required for update")

     // Filter out non-updatable fields
     const payload = {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        variants: product?.variants,
        ProductShipping: product?.ProductShipping
    }


    try {
        const res = await apiClient.put(`/${product.id}`, payload)
    if (!res) {
        throw new Error('Failed to update product')
    }
    return res.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error details: ' , {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
            })
            throw new Error(error.response?.data?.error || 'Failed to update product');
        }
        throw new Error('Failed to update product(useProducts.ts)')
    }
    
}

// update single product react-query function
export const useUpdateProduct = () => {

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateProduct,
        onMutate: async (newProduct) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({queryKey: ['products']})

            // Snapshot the previous value
            const previousProduct = queryClient.getQueryData(['products', newProduct.id])

            // Optimistically update
            queryClient.setQueryData(['products', newProduct.id], newProduct)

            return {previousProduct}
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousProduct) {
                queryClient.setQueryData(['products', variables.id], context.previousProduct)
            }
            console.error('Update error: ' , error)
        },
        onSuccess: (updatedProduct) => {

            // Update the cache directly for immediate UI update
            queryClient.setQueryData(['products', updatedProduct.id], updatedProduct)
            
            // invalidate the main list to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['products']})
        }
    })
}



/* -------------------------------------------------------------------------------------------------------------------- */
// DELETE PRODUCT



// Delete the Single product using api server
const deleteProduct = async (id:string): Promise<string> => {

    const res = await apiClient.delete(`/${id}`)
    if (!res) throw new Error('failed to delete the product')
    return res.data
}


// Delete product react-query Function
export const useDeleteProduct = () => {

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteProduct,
        onMutate: async (id) => {
            await queryClient.cancelQueries({queryKey: ['products']})
            const previousProducts = queryClient.getQueryData(['products']) || []

            queryClient.setQueryData<ProductFormValues[]>(['products'], (old = []) => 
                old?.filter((p) => p.id !== id)
            )

            return {previousProducts}
        },
        onSuccess: (deletedId) => {

            // Remove from both individual and list caches
            queryClient.removeQueries({ queryKey: ['products', deletedId] })
            queryClient.setQueryData<ProductFormValues[]>(
                ['products'],
                (old = []) => old.filter(product => product.id !== deletedId)
            )
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['products'], context?.previousProducts)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        }
    })
}


//----------------------------------------------------------------------------------------------------------------------------------
/** Get Deal */

const getDeal = async (): Promise<DealSchema> => {
   const res = await axios.get('/dashboard/products/dealoftheday/api')
        if (res.status !== 200) throw new Error
        return res.data
}


export const useDeal = () => {
    return useQuery<DealSchema>({
        queryKey: ['Deals'],
        queryFn: getDeal
    })
}



/** Set the product Deal to the Api */

const createDeal = async (deal: DealSchema): Promise<DealSchema> => {
    try {
        const res = await axios.post('/dashboard/products/dealoftheday/api', deal)
        if (res.status !== 201) throw new Error
        return res.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios Error: ', error.response?.data)
            throw new Error(error.response?.data.error || 'failed to create deal')
        } else {
            console.error('Unexpected error: ', error)
            throw new Error('Unexpected Error Occurred!!')
        }
    }
}


export const useCreateDeal = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createDeal,
        onSuccess: (newDeal) => {
            queryClient.setQueryData<DealSchema>(['Deals'], newDeal)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['Deals'] })
        }
    })
}

/** =================================================================================================================================== */
// GET VIEWS

// const fetchProductViews = async (id: string) => {
//     const res = await fetch(`/api/products/view/${id}`)
//     if (!res.ok) throw new Error('Failed to fetch product views')
//     return res.json()
// }

// export const useFetchProductViews = (id: string) => {
//     return useQuery({
//         queryKey: ['products', id],
//         queryFn: () => fetchProductViews(id)
//     })
// }