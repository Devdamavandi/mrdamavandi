

'use client'

import ProductCard from "@/components/productCard";
import { isProductNew } from "@/lib/utils";
import { ProductFormValues } from "@/types/zod";
import { useEffect, useState } from "react";

const ProductList = ({ slug, initialProducts }: { slug: string; initialProducts: ProductFormValues[] }) => {

    const [products, setProducts] = useState(initialProducts)
    const [page, setPage] = useState(1)

    useEffect(() => {
        if (page === 1) return // already loaded first page
        fetch(`/categories/api?category=${slug}&page=${page}&limit=10`)
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [page, slug])
    
    return ( 
        <div>
            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {products.map((p: ProductFormValues) => (
                        <ProductCard
                            key={p.id}
                            id={p.id ?? ""}
                            variantId={p.variants?.find(v => v.isDefault)?.id || p.variants?.[0]?.id || ""}
                            name={p.name}
                            image={p.images?.[0] || '/default-image.jpg'}
                            price={p.price}
                            stock={p.stock}
                            averageRating={p.averageRating}
                            badge={p.isOnSale ? "On Sale" : ""}
                            isNew={p.createdAt ? isProductNew(new Date(p.createdAt)) : false}
                            originalPrice={p.originalPrice}
                            hasFreeShipping={p.hasFreeShipping}
                            isBestseller={p.isBestSeller}
                            hreff={`/products/${p.slug}`}
                            WishlistItem={Array.isArray(p.WishlistItem) ? p.WishlistItem : []}
                        />
                    ))}
                </div>
            )}


            {/* Prev & Next Buttons */}
            <div className="flex gap-2 mt-4">
                <button 
                    onClick={() => setPage(prev => Math.max(1, prev - 1))} 
                    disabled={page === 1}
                    className="px-3 py-1 border rounded"
                    >
                    Prev
                </button>
                <button
                    onClick={() => setPage(prev => prev + 1)}
                    className="px-3 py-1 border rounded"
                >
                    Next
                </button>
            </div>


        </div>
     )
}
 
export default ProductList;