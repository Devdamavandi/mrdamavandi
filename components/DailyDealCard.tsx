import { useProducts, useSingleProduct } from "@/hooks/useProducts";
import Image from "next/image";
import { Zap, Clock } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import TrimText from "@/lib/trimText";
import { useCart } from "@/stores/usecart";
import Link from "next/link";

interface DealProductProps {
    id: string
    dealProductId: string
    discountRate?: number
    endTime?: Date
}

const DailyDealCard = ({id, dealProductId, discountRate, endTime}: DealProductProps) => {

    const {data: products} = useProducts()
    const IdenticalProduct = products?.find(p => p.id === id)

    const addItem = useCart((state) => state.addItem)
    const {data: Product} = useSingleProduct(dealProductId)
    
    const handleAddToCart = () => {
        if (!Product) return;
        addItem({
            productId: Product.id || "",
            variantId: Product.variants?.find(v => v.isDefault)?.id || Product.variants?.[0]?.id || "",
            name: Product.name,
            price: Product.price || 0,
            quantity: 1,
            stock: Product.stock ?? 0,
            image: Product.images?.[0] || ""
        })
    }

    
    const discountedPrice = (IdenticalProduct?.price ?? 0) * (1 - (discountRate || 0))
    return ( 
        <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-rose-500">
            <div className="flex items-center gap-2 mb-4">
                <Zap className="text-rose-500" size={20} />
                <span>
                    {discountRate ? `${Math.round(discountRate * 100)}% OFF` : 'DEAL'}
                </span>

                {endTime && (
                    <div className="flex items-center ml-auto text-gray-500">
                        <Clock size={16} className="mr-1" />
                        <CountdownTimer endTime={endTime} />
                    </div>
                )}
            </div>

            {/* Product Section */}
            <div className="flex flex-colmd:flex-row gap-6">
                {/* Image Division */}
                <div className="relative aspect-square w-full md:w-1/3">
                    <Image 
                        src={IdenticalProduct?.images[0] || '/default-image.jpg'}
                        alt={IdenticalProduct?.name || ''}
                        fill
                        className="rounded-lg object-cover"
                    />
                </div>

                {/* Right Next to Division */}
                <div className="flex-1">
                    <h3 className="text-xl font-bold">{TrimText(IdenticalProduct?.name || '', 124)}</h3>
                    <p className="text-gray-500 text-sm mb-4">SKU: {IdenticalProduct?.sku}</p>

                    {/* discountRate And Price Division */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-rose-600 font-bold text-2xl">
                            ${discountedPrice.toFixed(2)}
                        </span>
                        {discountRate && (
                            <span className="text-gray-400 line-through">
                                ${IdenticalProduct?.price.toFixed(2)}
                            </span>
                        )}
                    </div>


                    {/* ADD TO CART and PRODUCT DETAILS */}
                    <div className="flex flex-col sm-flex-row gap-3">
                        <button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-md font-medium flex-1 transition-colors cursor-pointer"
                            onClick={handleAddToCart}
                        >
                            Add to Cart
                        </button>

                        <Link href={`/products/${Product?.slug}`}
                            className="border border-rose-600 text-rose-600 hover:bg-rose-50 px-6 py-3 rounded-md font-medium flex-1 transition-colors  text-center"
                        >
                            <button className="cursor-pointer">
                                View Details
                            </button>
                        </Link>
                    </div>


                    {/* Stock indicator */}
                    {IdenticalProduct?.stock && IdenticalProduct?.stock < 10 && (
                        <div className="mt-4 text-sm text-amber-600">
                            Only {IdenticalProduct.stock} left in stock!
                        </div>
                    )}
                </div>
            </div>
        </div>
     );
}
 
export default DailyDealCard;