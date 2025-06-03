

import { Star } from "lucide-react"
import ProductImageComponent from "./dashboard/ProductImage"


interface ProductDetailsProps {
    product: {
        id: string
        name: string
        slug: string
        price: number
        description?: string
        stock: number
        discountPercentage: number
        originalPrice: number
        averageRating: number
        images: string[]
        category?: {
            name: string
        }
    }
}

const ProductDetails = ({product}: ProductDetailsProps) => {


    return ( 
        <div className="container flex gap-2">
            {/* Image */}
            <div>
                
                <ProductImageComponent 
                key={product.id} 
                initialImages={product.images} 
                onImagesChange={undefined}
                viewMode
                 />
            </div>
            {/* Product Info */}
            <div>
                <h1 className="max-w-xl font-medium/50 text-3xl text-justify tracking-tight pt-2">{product.name}</h1>
                <div className="flex mt-4 items-center gap-2">
                    <span className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={16}
                                className={`${i < product.averageRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                        ))}
                    </span>
                    <span>({product.averageRating})</span>
                </div>
                <hr className="w-full text-gray-300 mt-2"/>
                {/* Price Section */}
                <div className="mt-4">
                    {product.discountPercentage ? (
                        <div className="flex gap-4">
                            <span className="text-red-500 text-3xl">-{product.discountPercentage}%</span>
                            <div className="space-x-0.5">
                                <span className="text-md"><sup>$</sup></span>
                                <span className="text-3xl">{product.price}</span>
                            </div>
                        </div>
                    )
                    :
                    (
                        <span>{product.price}</span>
                    )}
                    {/* Original Price */}
                    <div>
                        <span className="text-sm text-gray-600">original price: </span>
                        <span className="line-through font-light">{product.originalPrice}</span>
                    </div>
                    {/* Color */}
                    <div>Color: {}</div>
                </div>
            </div>
        </div>
     );
}
 
export default ProductDetails;