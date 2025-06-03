
'use client'

import { useSingleProduct } from "@/hooks/useProducts";

const SingleProductPage = ({params} : {params: {id: string}}) => {

    const {data: Product, isLoading, error} = useSingleProduct(params.id)
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

export default SingleProductPage