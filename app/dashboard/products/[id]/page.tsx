
'use client'

import { useSingleProduct } from "@/hooks/useProducts";

interface PageProps {
    params: { id: string }
}

export default function SingleProductPage({params} : PageProps) {

    const { id } = params

    const {data: Product, isLoading, error} = useSingleProduct(id)
    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error...{error.message}</div>

    return ( 
        <div>
            <p>Product ID: {Product?.id}</p>
            <p>Product Name: {Product?.name}</p>
            <p>Category: {Product?.category?.name || 'Uncategorized!'}</p>
        </div>
    )
}

