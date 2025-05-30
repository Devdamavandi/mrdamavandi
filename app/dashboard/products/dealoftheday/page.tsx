

'use client'
import TopNavigationNav from "@/components/dashboard/top-nav";
import { Button } from "@/components/ui/button";
import { useCreateDeal, useProducts } from "@/hooks/useProducts";
import { DealSchema, ProductFormValues } from "@/types/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { string } from "zod";


interface DealProductProps {
    id: string
    name: string
    sku: string
}

const DealOfTheDayForm = () => {

    const [searchTerm, setSearchTerm] = useState<string>('')
    const [chosenProduct, setChosenProduct] = useState<DealProductProps>({
        id: '', name: '', sku: ''
    })
    const [listVisibility, setListVisibility] = useState(false)

    const {data: products, isLoading, error} = useProducts()

    const {register, formState: {errors}, handleSubmit, reset} = useForm<DealSchema>({
        defaultValues: {
            id: '',
            dealName: '',
            dealEndTime: new Date(),
            dailyDealProduct: {
                id: '',
                name: '',
                sku: ''
            },
            discountRate: 0,
            isActive: false
        }
    })


    const {mutate: createDeal, isPending: isCreating} = useCreateDeal()

    const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) || []


    const handleChosenProduct =  (productId: string) => {
        const selectedProduct = filteredProducts.find(fp => fp.id === productId)
        if (!selectedProduct) return
        setChosenProduct({id: selectedProduct?.id || '', name: selectedProduct?.name || '', sku: selectedProduct?.sku || ''})
        setListVisibility(false)
        setSearchTerm(selectedProduct.name)
    }

    useEffect(() => {
        console.log('Chosen Product: ', chosenProduct)
    }, [chosenProduct, setChosenProduct])

    const onSubmit = async (data: DealSchema) => {
        const payload = {
            ...data,
            dailyDealProduct: { id: chosenProduct.id } // Only need the ID for prisma relation
        }
        try {
            await createDeal(payload)
            toast.success('Deal Created!')
            // Clean Everything
            reset()
            setSearchTerm('')
            setChosenProduct({id: '', name: '', sku: ''})
        } catch  {
            toast.error('Failed to Set the Deal!!')
        }
    }

    return ( 
        <div>
            <TopNavigationNav/>
            <h1 className=" mt-10 text-4xl">Daily-deal Setting</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="w-5/12 mt-4 flex flex-col gap-4">

                {/* Put a Name for the Deal */}
                <input 
                    type="text"
                    id="dealName"
                    {...register('dealName')}
                    placeholder="Daily Deal Name"    
                    className={`p-2 border border-gray-300 rounded ${errors.dealName ? 'border-red-500' : ''}`}
                 />
                 {/* Choose Deal End Time */}
                <input 
                    type="date"
                    id="dealEndTime"
                    {...register('dealEndTime')}
                    className={`p-2 border border-gray-300 rounded ${errors.dealEndTime ? 'border-red-500' : ''}`}
                 />
                 {/* Search Products */}
                <div>
                    <input
                        type="text"
                        id="dailyDealProduct"
                        {...register('dailyDealProduct')}
                        placeholder="Search Product Name Here..."
                        value={searchTerm}
                        className={`p-2 border border-gray-300 rounded w-full ${errors.dailyDealProduct ? 'border-red-500' : ''}`}
                        onChange={async (e) => {
                            setListVisibility(true)
                            setSearchTerm(e.target.value)
                        }}
                     />
                    {(searchTerm && listVisibility) && (
                        <div className="bg-white overflow-y-scroll h-[200px]">
                            <ul className="flex flex-col gap-1">
                                {filteredProducts?.map((fp) => (
                                    <li key={fp?.id} 
                                        className="hover:bg-blue-300 hover:cursor-pointer"
                                        onClick={() => handleChosenProduct(fp.id || '')}
                                        >
                                            {fp?.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                
                <input 
                    type="number"
                    step={0.01}
                    id="discountRate"
                    {...register('discountRate')}
                    placeholder="Set Discount Rate"    
                    className={`p-1 border border-gray-300 rounded ${errors.discountRate ? 'border-red-500' : ''}`}
                 />

                
                <div className="flex items-center gap-1">
                    <input
                        type="checkbox"
                        step={0.01}
                        id="isActive"
                        {...register('isActive')}
                        placeholder="Set Discount Rate"
                        className={`p-1 size-5 border border-gray-300 rounded ${errors.isActive ? 'border-red-500' : ''}`}
                     />
                    <label htmlFor="isActive">Active</label>
                </div>
                 <Button
                    type="submit"
                    className="hover:bg-blue-600 bg-blue-500 px-4 py-2 w-full text-white"
                    disabled={isCreating}
                 >
                    Submit
                 </Button>
            </form>
        </div>
     )
}
 
export default DealOfTheDayForm;