import { VariantFormValues } from "@/types/zod"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"


const VariantsClient = axios.create({
    baseURL: 'https://mrdamavandi.vercel.app/dashboard/variants/api',
    headers: {'Content-Type': 'application/json'}
})


const fetchVariants = async () => {
    const res = await VariantsClient.get('/')
    return res.data
}

export const useVariants = () => {
    return useQuery({
        queryKey: ['variants'],
        queryFn: fetchVariants
    })
}


/** =====================================================  */

const fetchSingleVariant = async (id: string): Promise<VariantFormValues> => {
    const res= await VariantsClient.get(`/${id}`)
    return res.data
}

export const useSingleVariant = (id: string) => {
    return useQuery<VariantFormValues>({
        queryKey: ['variants', id],
        queryFn: () => fetchSingleVariant(id),
        enabled: !!id  // only fetch if ID exists   
    })
}
