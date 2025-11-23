




import { useDeviceType } from "@/hooks/useDeviceType";
import TrimText from "@/lib/trimText";
import { useCart } from "@/stores/usecart";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import Image from "next/image";
import { useRouter } from "next/navigation";



const BasketPopover = () => {

    const count = useCart((state) => state.items.length)
    const items = useCart((state) => state.items)
    const decreaseQuantity = useCart((state) => state.decreaseQuantity)
    const increaseQuantity = useCart((state) => state.increaseQuantity)
    const ClearAll = useCart((state) => state.clearCart)
    const removeItem = useCart((state) => state.removeItem)

    const router = useRouter()

    const deviceType = useDeviceType()

    return ( 
        <Popover>
            <PopoverTrigger>
                <div className="cursor-pointer relative text-left pl-3">
                    <p className="text-2xl">🛒</p>
                    <span className="text-lg absolute -top-3 text-red-500 pl-4">{count !== 0 && count}</span>
                </div>
            </PopoverTrigger>
            <PopoverContent>
                {count > 0 ? (
                    <div 
                    className={`bg-white p-4 overflow-y-scroll overflow-x-hidden
                        ${deviceType === 'tablet' ? 'w-xl' : 
                        deviceType === 'min-tablet' ? 'w-md' : 
                        deviceType === 'mobile' && 'w-xs'}
                      border-gray-200 border rounded-sm mt-4`}>
                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 py-2">
                            <Image
                                src={item.image || '/default-image.jpg'}
                                alt={item.name}
                                priority
                                sizes="100%"
                                width={45}
                                height={45}
                                className="object-cover aspect-square"
                            />
                            {/* Increase/Decrease quantity */}
                            <div className="flex items-center gap-1 w-fit">
                                <button
                                className="px-2 py-1 hover:bg-gray-300 rounded-md bg-gray-50 border border-gray-200 cursor-pointer"
                                onClick={() => decreaseQuantity(item.variantId)}
                                >-</button>
                                <input type="number" className="w-10 text-center bg-white py-1" readOnly value={item.quantity}/>
                                <button
                                className="px-2 py-1 hover:bg-gray-300 rounded-md bg-gray-50 border border-gray-200 cursor-pointer"
                                onClick={() => increaseQuantity(item.variantId, item.stock)}
                                >+</button>
                            </div>
                            {/* Item Name */}
                            <p>{TrimText(item.name, 42)}</p>
                            {/* Remove item button */}
                            <button 
                            onClick={() => removeItem(item.variantId)}
                            className="bg-red-500 hover:bg-red-600 transition cursor-pointer rounded-full flex items-center justify-center text-white w-4 h-4 ml-2">
                                X
                            </button>
                            {/* Total Line */}
                            <hr className="mt-5 border-gray-200 w-[calc(100%+30rem)]"/>
                    </div>
                ))}
                        {/* Bottom Buttons */}
                        <div className="mt-4 flex justify-between">
                            <button className={`bg-red-500 hover:bg-rose-600 px-4 py-2 text-white rounded cursor-pointer`} onClick={ClearAll}>Clear All</button>
                                <button
                                    className={`px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded cursor-pointer`}
                                    disabled={count === 0}
                                    onClick={() => router.push('/checkout')}
                                >
                                    Proceed To Checkout
                                </button>
                        </div>
                </div>
                ) : (
                    <div className="flex flex-col items-center justify-center bg-white p-4 w-md shadow-md h-20 border-gray-200 border rounded-sm mt-4">
                        <h1 className="font-semibold text-2xl">Shopping Cart Empty</h1>
                        <p className="text-sm">No Items Added to the Cart Yet!!</p>
                    </div>
                )}
                
            </PopoverContent>
        </Popover>

     
     )
}
 
export default BasketPopover;