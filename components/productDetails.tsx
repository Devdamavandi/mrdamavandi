
'use client'

import { Star } from "lucide-react"
import ProductImageComponent from "./dashboard/ProductImage"
import { ShippingSchema, VariantFormValues } from "@/types/zod"
import { useCart } from "@/stores/usecart"
import {Heart} from 'lucide-react'
import { useEffect, useState } from "react"
import { useCreateWishlist, useDeleteWishlist } from "@/hooks/useWishlist"
import { useSession } from "next-auth/react"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import { FaHeart } from "react-icons/fa"
import RichTextRenderer from "./RichTextRenderer"

interface ProductDetailsProps {
    product: {
        id: string
        name: string
        slug: string
        price: number
        WishlistItem?: { userId: string }[]
        description?: string
        stock: number
        discountPercentage: number
        originalPrice: number
        averageRating: number
        images: string[]
        category?: {
            name: string
        },
        variants: VariantFormValues[],
        whatsInTheBox: {
            html: string
            text: string[]
            images?: string[]
        },
        hasFreeShipping: boolean,
        returnGuarantee: boolean,
        ProductShipping: ShippingSchema
    }
}


const ProductDetails = ({product}: ProductDetailsProps) => {

  

    const [heartClicked, setHeartClicked] = useState(false)

    const decreaseQuantity = useCart((state) => state.decreaseQuantity)
    const items = useCart((state) => state.items)
    const increaseQuantity = useCart((state) => state.increaseQuantity)
    const addItem = useCart((state) => state.addItem)

    const {mutate: createWishlist, isPending} = useCreateWishlist()
    const {mutate: deleteWishlist} = useDeleteWishlist()
    
    const {data: session} = useSession()
    const userID = session?.user?.id

    const router = useRouter()

    useEffect(() => {
        if (userID && product.WishlistItem) {
            const match = product.WishlistItem?.some(item => item.userId === userID)
            setHeartClicked(match)
        }
    }, [product.WishlistItem, userID])

    const handleToggleWishlist = async () => {
        if (!userID) {
            toast.error('Please login first and then Add to Wishlist!!')
            return
        }

        if (!heartClicked) {
            createWishlist({ productID: product.id, userID })
            setHeartClicked(true)
        } else if (heartClicked) {
            deleteWishlist({userID, productID: product.id})
            setHeartClicked(false)
        }
    }
    
    const handleAddToCart = () => {
        addItem({
            productId: product.id!,
            variantId: product.variants.find((v) => v.isDefault)?.id || product.variants[0]?.id || "",
            name: product.name,
            price: product.price,
            quantity: 1,
            stock: product.stock,
            image: product.images[0]
        })
    }


    return ( 
        <div className="container flex flex-col gap-2">
            {/* Top Section */}
            <div className="flex gap-2">
                <div className="flex-2">
                    <ProductImageComponent
                    key={product.id}
                    initialImages={product.images}
                    onImagesChange={undefined}
                    viewMode
                     />
                </div>

                <div className="flex-3">
                    <h1 className="max-w-xl font-medium/50 text-3xl text-justify tracking-tight pt-2">{product.name}</h1>
                    {/* Star and rating */}
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
                    {/* from Price to AddtoWishlist */}
                    <div className="space-y-2">
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
                                <span>${product.price}</span>
                            )}
                            {/* Original Price */}
                            {product.originalPrice && (
                            <div>
                                <span className="text-sm text-gray-600">original price: </span>
                                <span className="line-through font-light">{product.originalPrice}</span>
                            </div>
                            )}
                        </div>
                        {/* Color */}
                        <div className="flex gap-2 text-sm">
                            <div className="flex flex-col">
                                {
                                product.variants.map((variant, index) => (
                                    <div key={index} className="flex gap-4">
                                        <p>{variant.attributes.color}</p>
                                        <p>{variant.attributes.size}</p>
                                    </div>
                                ))
                            }
                            </div>
                        </div>
                        {/* Stock */}
                        <div>
                            {
                                (product.stock > 0 && product.stock < 10) ?
                                (
                                    <div>
                                        <p className="text-orange-400">only {product.stock} left in stock!</p>
                                        <div className="mt-2 w-34 h-1.5 rounded bg-gray-200/70">
                                            <div style={{width: `${  (product.stock / 10) * 100}%`  }} className="bg-orange-400 h-1.5 rounded"></div>
                                        </div>
                                    </div>
                                )
                                :
                                product.stock === 0 ?
                                (
                                    <div className="text-red-500">out of stock</div>
                                )
                                :
                                (
                                    <div className="text-green-500">in stock</div>
                                )
                            }
                        </div>
                        {/* SKU (Product Code) */}
                        <div className="text-sm">
                            {product.variants.map((variant, index) => (
                                <div key={index}>{
                                    variant.isDefault && (
                                        <p>Code: {variant.sku}</p>
                                    )
                                }</div>
                            ))}
                        </div>
                        {/* Quantity */}
                        <div className="flex items-center w-fit gap-1">
                                <div>
                                    <button
                                    type="button"
                                    className="px-2 py-1 hover:bg-gray-300 rounded-md bg-gray-50 border border-gray-200 cursor-pointer"
                                    onClick={(e) => {e.preventDefault(); decreaseQuantity(product.id, (product.variants?.find(v => v.isDefault)?.id || product.variants?.[0]?.id || ""))}}
                                    >
                                    -
                                    </button>
                
                                    <input
                                        type="number"
                                        className="w-12 text-right bg-white py-1"
                                        readOnly
                                        value={
                                            items.find(
                                                item =>
                                                    item.productId === product.id &&
                                                    item.variantId === (product.variants?.find(v => v.isDefault)?.id || product.variants?.[0]?.id || "")
                                            )?.quantity ?? 0
                                        }
                                    />
                
                                    <button
                                    type="button"
                                    className="px-2 py-1 hover:bg-gray-300 rounded-md bg-gray-50 border border-gray-200 cursor-pointer"
                                    onClick={(e) => {e.preventDefault(); increaseQuantity(product.id, (product.variants?.find(v => v.isDefault)?.id || product.variants?.[0]?.id || ""), product.stock)}}
                                    >
                                    +
                                    </button>
                                </div>
                        </div>
                        {/* Add To Cart Section*/}
                        <div className="flex items-baseline-last gap-4">
                            <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={product.stock !== 0 ?
                                'bg-black px-4 py-2 text-white rounded-md transition-opacity duration-300 text-sm font-medium hover:bg-gray-800 cursor-pointer mt-4'
                                 : 'bg-gray-200 rounded-md transition-opacity duration-300 text-sm font-medium px-4 py-2 text-white mt-4'
                            }
                            >
                                Add to Cart
                            </button>
                            {/* Wishlist */}
                            <button
                            className={heartClicked ?
                                "flex items-center justify-center border border-gray-100 py-1.5 px-4 rounded-md bg-pink-100 gap-1 hover:bg-pink-200 cursor-pointer"
                                :
                                "flex items-center justify-center border border-gray-100 py-1.5 px-4 rounded-md bg-gray-100 gap-1 hover:bg-pink-200 cursor-pointer"
                            }
                            type="button"
                            onClick={handleToggleWishlist}
                            disabled={isPending}
                            >
                            {heartClicked ? (
                                <>
                                    <FaHeart size={'16px'}
                                    className={heartClicked ? 'text-red-500' : ''}/>
                                    Added to Wishlist
                                </>
                                ) : (
                                <>
                                    <Heart size={'16px'}/>
                                    Add to Wishlist
                                </>
                            )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Right */}
                <div className="flex flex-col border border-gray-300 shadow-md rounded-md flex-1 h-1/2 p-4 space-y-2">
                    <label className="text-sm">ships in:  <strong className="pl-1">{product?.ProductShipping.shipsIn}</strong></label>
                    <label className="text-sm">destination: <strong className="pl-1">{product?.ProductShipping.shipsTo}</strong></label>
                    <label className="text-sm">Estimated time: <strong className="pl-1">{product?.ProductShipping.estimatedTime}</strong></label>
                    <label className="text-sm">shipping cost: <strong className="pl-1">${product?.ProductShipping.cost}</strong></label>
                    <hr className="text-gray-300 my-2"/>
                    <label>Total: {(items.reduce((sum, item) => sum + item.quantity * item.price, 0) + (Number(product.ProductShipping?.cost) || 0))}</label>
                    <button
                            type="button"
                            onClick={() => router.push('/checkout')}
                            disabled={product.stock === 0}
                            className={product.stock !== 0 ?
                                'bg-yellow-500 px-4 py-2 text-gray-900 rounded-md transition-opacity duration-300 text-sm font-medium hover:bg-amber-500/85 cursor-pointer mt-4'
                                 : 'bg-gray-200 rounded-md transition-opacity duration-300 text-sm font-medium px-4 py-2 text-white mt-4'
                            }
                            >
                                Proceed To Checkout
                    </button>
                </div>

            </div>
            {/* Description */}
            <div className="mt-6">
                <h1 className="mb-4">Description:</h1>
                {product.description ? (
                    // If description is a string, render it directly; otherwise, pass to RichTextRenderer
                    Array.isArray(product.description) ? (
                        <RichTextRenderer content={product.description} />
                    ) : (
                        <p>{product.description}</p>
                    )
                ) : (
                    <p>No description available</p>
                )}
            </div>
            {/* Whats In The Box */}
            <div className="px-4">
                <h3>{`What's in the Box`}</h3>
                <ul className="list-disc pl-6">
                    {product.whatsInTheBox?.text?.map ?
                    product.whatsInTheBox.text.map((item, index) => (
                        <li key={index} className="">{item}</li>
                    )) : <li className="text-sm">No items listed</li>}
                </ul>
            </div>
            
        </div>
     );
}
 
export default ProductDetails;