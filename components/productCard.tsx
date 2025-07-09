


import { useCart } from "@/stores/usecart"
import { Heart, ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"


type ProductCardProps = {
    id?:string
    name: string
    price: number
    originalPrice?: number // For showing discounts
    image: string
    stock: number
    averageRating?: number
    badge?: string | '' | null
    isNew?: boolean
    isBestseller?: boolean
    hasFreeShipping?: boolean
    returnGuarantee?: boolean
    hreff?: string
    variantId?: string
}


const ProductCard = ({ 
    id, 
    name, 
    hreff,  
    price, 
    image, 
    stock, 
    averageRating = 0, 
    badge, 
    originalPrice, 
    isNew = false, 
    isBestseller = false, 
    hasFreeShipping,
    variantId
} : ProductCardProps) => {

    const discount = originalPrice ? 
                     Math.round(((originalPrice - price) / originalPrice) * 100)
                     : 0

    // Grab the addItem action
    const addItem = useCart((state) => state.addItem)
    const items = useCart((state) => state.items)

    const handleAddToCart = () => {
        addItem({
            productId: id!,
            variantId: variantId ?? "",
            name,
            price,
            quantity: 1,
            stock,
            image
        })
    }

    useEffect(() => {
        console.log(items)
    }, [items])
                     
    return ( 
                <div 
                className="group relative bg-white p-4 rounded-lg shadow-sm hover:shadow-md 
                transition-all duration-300 border border-gray-300 w-full h-full">


                    {/* Product Image & Other Info */}
                    <div className="flex flex-col justify-between flex-1 h-full">
                        {/* ---Badges (Sale, New, Bestseller, Low Stock)--- */}
                        {isNew && (
                            <span className="bg-blue-500 absolute top-2 right-2 text-white text-xs px-2 py-1 rounded-full z-9 font-medium">
                                New
                            </span>
                        )}
                        {isBestseller && (
                            <span className="absolute top-8 left-2 drop-shadow-[0_0_10px_rgba(234,179,8,9.8)] text-yellow-300 text-sm bg-black/70 px-2 py-1 rounded z-10">
                                BestSeller!
                            </span>
                        )}
                        { (stock !== 0 && stock < 10) && (
                            <span className="absolute top-2 left-2 bg-rose-100 text-xs px-2 py-1 rounded text-black z-9">
                                {badge || `Only ${stock} left`}
                            </span>
                        )}
                      
                        


                        {/* Product Image */}
                        <div className="aspect-square relative mb-3 rounded-md">
                            {image && (
                                <Link href={hreff || ''}>
                                    <Image
                                        src={image}
                                        alt={name}
                                        fill
                                        priority
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </Link>
                            )}
                            {/* Quick Add to Cart (Hover) */}
                            <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full
                            shadow-md opacity-0 group-hover:opacity-100 transition">
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        </div>


                        {/* Product Info Section*/}
                        <section className="flex flex-col justify-between h-full">
                            <div>

                                <Link href={hreff || ''} className="font-medium text-gray-800 line-clamp-4 hover:text-indigo-500">{name}</Link>

                                {/* Stars and Rating */}
                                <div className="flex items-center gap-1 mt-1 justify-between">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                            key={i}
                                            size={16}
                                            className={`${i < averageRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                            />
                                        ))}
                                        <span className="text-xs text-gray-500 ml-1">({averageRating})</span>
                                    </div>
                                    {/* Wishlist button (Top Right) */}
                                    <div>
                                        <button className="lg:opacity-0
                                        group-hover:opacity-100 transition-opacity duration-200 hover:text-rose-500 z-10 cursor-pointer">
                                            <Heart className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Calculate discount (if originalPrice exists) */}
                                {originalPrice && (
                                    <div className="flex gap-2 items-center mt-1">
                                        <span className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
                                        <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">{discount}% OFF</span>
                                    </div>
                                )}
                                
                                {/* Simplified Price (No Discount) */}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-bold text-gray-900">${price.toFixed(2)}</span>
                                    {hasFreeShipping && (
                                        <span className="textxs bg-green-100 text-green-800 px-1.5 py-0.5 rounded ml-auto">Free Shipping</span>
                                    )}
                                </div>


                                {/* stock */}
                                <div>
                                    {stock === 0 ? (
                                        <p className="text-rose-500">out of stock</p>
                                    ) : stock < 10 ? (
                                        <div>
                                            <p className="text-amber-600 text-sm mb-1">{`only ${stock} left`}</p>
                                            <div className="w-full bg-gray-200 h-1.5 rounded-md">
                                                <div className='bg-amber-500 h-1.5 rounded-full'
                                                        style = {{   width: `${(stock / 10) * 100}%`   }}>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-emerald-400">in stock</p>
                                    )}
                                </div>
                            </div>
                            </section>


                        {/* Button */}
                        <div className="mt-1">
                            {/* Add To Cart Button */}
                            <button 
                            className={stock !== 0 ? 
                            'w-full bg-black py-2 text-white rounded-md lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium hover:bg-gray-800 cursor-pointer'
                             : 'bg-gray-200 rounded-md lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium w-full py-2 text-white'}
                             onClick={handleAddToCart} disabled={stock === 0}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
    

                </div>
     )
}
 
export default ProductCard;