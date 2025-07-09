


'use client'

import ProductCard from "@/components/productCard";
import { useProducts } from "@/hooks/useProducts";
import TrimText from "@/lib/trimText";
import { isProductNew } from "@/lib/utils";

const ProductsPage = () => {

    const {data: products = [], isLoading, error} = useProducts()
   
    if (isLoading){
        return (
            <div className="p-4">
                <h1>Products</h1>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-2">
                    {[...Array(10).map((_, i) => (
                    <div key={i} className="shadow-md flex flex-col p-2 gap-6">
                            <div className="aspect-square bg-gray-200 animate-pulse rounded"></div>
                            <div className="flex flex-col gap-2">
                                <div className="bg-gray-200 animate-pulse rounded h-4"></div>
                                <div className="bg-gray-200 animate-pulse rounded h-4 w-1/2"></div>
                                <div className="bg-gray-200 animate-pulse rounded h-4 w-1/3"></div>
                            </div>
                    </div>
                    ))]}
                </div>
            </div>
        )
    }
    if (error) return <div className="text-2xl text-rose-400">An Error Occurred...</div>
     if (products?.length === 0) {
        return (
           <div className="p-4">
             <h1>Products</h1>
             <div className="text-center py-8">No products available</div>
           </div>
        )
    }
    
    return ( 
        <div className="p-4">
            <h1>Products</h1>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-2">
                {products.map((product) => (
                    <ProductCard key={product.id} 
                        id={product.id}
                        variantId={product.variants?.find(v => v.isDefault)?.id || product.variants?.[0]?.id || ""}
                        name={TrimText(product.name, 120)}
                        price={product.price}
                        image={product.images[0] || 'default-image.jpg'}
                        averageRating={product.averageRating}
                        stock={product.stock}
                        isNew={product.createdAt ? isProductNew(new Date(product.createdAt)) : false}
                        originalPrice={product.originalPrice}
                        hasFreeShipping={product.hasFreeShipping}
                        returnGuarantee={product.returnGuarantee}
                        badge={product.isOnSale ? "Sale" : ""}
                        isBestseller={product.isBestSeller}
                        hreff={`/products/${product.slug}`}
                        />
              ))}
            </div>
        </div>
     )
}
 
export default ProductsPage;