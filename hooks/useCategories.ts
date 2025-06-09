


import { CategorySchema } from '@/types/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {'Content-Type': 'application/js'}
})

/* -------------------------------------------------------------------------------------------------------------------- */
// GET ALL Categories


const getCategories = async (): Promise<CategorySchema[]> => {
    const res = await apiClient.get('/dashboard/categories/api/')
    return res.data
}


export const useCategories = () => {
    return useQuery<CategorySchema[]>({
        queryKey: ['categories'],
        queryFn: getCategories
    })
}



/* -------------------------------------------------------------------------------------------------------------------- */
// Create Category

const createCategory = async (category: Omit<CategorySchema, 'id'>) : Promise<CategorySchema> => {

    const res = await apiClient.post('/dashboard/categories/api', category)
    return res.data
}

export const useCreateCategory = () => {
    
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createCategory,
        onSuccess: (newCategory) => {
            // invallidate and also add to cache immediately
            queryClient.setQueryData<CategorySchema[]>(['categories'], (old = []) => [
                ...old,
                newCategory
            ])
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
    })
}


/* -------------------------------------------------------------------------------------------------------------------- */
// Update Category


const updateCategory = async (category: CategorySchema) : Promise<CategorySchema> => {

    const res = await apiClient.put('/dashboard/categories/api', category)
    return res.data
}

export const useUpdateCategory = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
        }
    })
}
