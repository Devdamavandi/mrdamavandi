
'use client'

import ProductForm from "@/components/dashboard/ProductForm";
import { useSingleProduct } from "@/hooks/useProducts";
import React from "react";

interface PageProps {
    params: { id: string }
}

const EditProductPage = ({params} : PageProps) => {

    
    // This is for reducing new NExtjs errors about params
    const {id} = params
    const {data: product, isLoading, error} = useSingleProduct(id)

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error loading product: {error.message}</div>
    
    return ( 
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Product</h1>
                
                
            </div>


            <div className="bg-white p-6 rounded-lg shadow">
                <ProductForm defaultValues={product} />
            </div>
        </div>
     )
}
 
export default EditProductPage;