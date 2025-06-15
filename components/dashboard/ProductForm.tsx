
'use client'

import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { ProductFormValues } from "@/types/zod";
import { useRouter } from "next/navigation";
import {useForm} from 'react-hook-form'
import {toast} from 'react-toastify'
import { Button } from "../ui/button";
import { useCategories } from "@/hooks/useCategories";
import ProductImageComponent from "./ProductImage";
import { useState } from "react";
import NestedCategorySelect from "./NestedSelect";
import { generateSKU } from "@/lib/sku-generator";
import { VariantFormValues } from "@/types/zod";
import { v4 as uuidv4 } from 'uuid'
import RichTextEditor from "../RichTextEditor";

interface ProductFormProps {
    defaultValues?: ProductFormValues
}


const ProductForm = ({defaultValues} : ProductFormProps) => {

    const router = useRouter()
    const { mutate: createProduct, isPending: isCreating} = useCreateProduct()
    const {mutate: updateProduct, isPending: isUpdating} = useUpdateProduct()
    const isSubmitting = isCreating || isUpdating

    const { data: categories} = useCategories()


    const [productImages, setProductImages] = useState<string[]>(Array.isArray(defaultValues?.images) ? defaultValues.images.filter((img): img is string => !!img) : [])
    const [variants, setVariants] = useState<VariantFormValues[]>(
        defaultValues?.variants?.map(v => ({...v, id: v.id || uuidv4()})) || []
    )
    

    
    // 1.Initialize RHF with zod Resolver
    const {register, handleSubmit, formState: {errors}, setValue, watch, trigger} = useForm<ProductFormValues>({
        defaultValues: defaultValues || 
    {  
        name: '',
        description: '',
        sku: '',
        price: 0,
        stock: 0,
        variants: [],
        categoryId: undefined
    },
    })

    const [whatInBox, setWhatsInBox] = useState<string>(
        typeof defaultValues?.whatsInTheBox === 'string'
        ? defaultValues.whatsInTheBox
        : defaultValues?.whatsInTheBox?.html || ''
    )
 

    // 2.Form submission handler
    const onSubmit = async (data: ProductFormValues) => {

        if (!data.sku) {
            toast.error('Please generate an SKU first!')
            return
        }

        const defaultVariant = variants.filter(v => v.isDefault)
        if (defaultVariant.length > 1) {
            toast.error('Only one variant can be marked as default')
            return
        }
        
        if (variants.length > 0 && defaultVariant.length === 0) {
            variants[0].isDefault = true
        }

        // Extract text content for SEO
        const extractTextContent = (html: string): string[] => {
            const text = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
            return text.split('*').map(t => t.trim()).filter(s => s.length > 0)
        }

        // Extract image Urls for indexing 
        const extractImageUrls = (html:string) => {
            if (typeof window === 'undefined') return []
            const doc = new DOMParser().parseFromString(html, 'text/html')
            return Array.from(doc.querySelectorAll('img')).map(img => img.src)
        }
        // Convert string numbers to actual numbers
        const processedData = {
            ...data,
            images: productImages,
            price: Number(data.price),
            stock: Number(data.stock),
            categoryId: data.categoryId || undefined,
            variants: variants,
            whatsInTheBox: {
                html: whatInBox.replace(/src="data:image[^"]+"/g, ''), // Remove Base64
                images: extractImageUrls(whatInBox), // Now contains CDN URLs only
                text: extractTextContent(whatInBox).join('\n')
            }
        }

       try {
        if (defaultValues?.id) {
            await updateProduct({...processedData, id: defaultValues.id})
            toast.success('Product Updated')
            console.log('Return Guarantee Enabled: ', data.returnGuarantee)
        } else {
            await createProduct(processedData)
            toast.success('Product Created')
        }
        router.push('/dashboard/products')
        router.refresh()
       } catch (error) {
        console.error('Submission error: ', error)
        toast.error(defaultValues?.id ? 'failed to update product' : 'failed to create product')
        if (error instanceof Error) {
            console.error('Detailed error: ', error.message)
        }
       }
    }


    // For Creating or Updating Variant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateVariant = (id: string, field: string, value: any) => {
        setVariants(prevVariants => 
            prevVariants.map(v => 
                v.id === id ? {...v, [field]: value} : v
            ))
    }

    // For Creating or Updating a Variant's Attribute
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateVariantAttribute = (id: string, attr: string, value: any) => {
        setVariants(prevVariants => 
            prevVariants.map(v => 
                v.id === id ? {...v, attributes: {...v.attributes, [attr]: value }} : v
            )
        )
    }

    const generateVariantSKU = async (variant: VariantFormValues) => {
        if (variant.sku && variant.sku !== '') return variant.sku

        try {
            return await generateSKU(
                watch('name'),
                watch('categoryId') || null,
                variant.attributes
            )
        } catch (error) {
            console.error('Failed to generate variant SKU: ', error)
            return ''  // or handle error as needed
        }
    }



    return ( 
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex justify-between gap-4">

        {/* Data Section */}
        <div className="flex-3 space-y-4">


            {/* Name Field */}
            <div>
                <label htmlFor="name" className="block mb-2 font-semibold">Product Name*</label>
                <input
                id="name"
                {...register('name')}
                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter product name"
                 />
            </div>


            {/* Description Field */}
            <div>
                <label htmlFor="description" className="block mb-2 font-semibold">Description*</label>
                <textarea
                id="description"
                rows={4}
                {...register('description')}
                className={`w-full p-2 border rounded-md border-gray-300`}
                placeholder="Enter product description"
                 />
            </div>

            {/* What's in the box */}
            <div className="space-y-1 w-full">
                <h1 className="font-semibold">{`What's in the box`}</h1>
                <RichTextEditor value={whatInBox || ''} onChange={(content) => setWhatsInBox(content)} />
            </div>

            {/* Category SelectBox */}
            <div className="my-4 mb-6">
                <NestedCategorySelect 
                    categories={categories || []}
                    value={watch('categoryId') || ''}
                    onChange={(value) => {
                        setValue('categoryId', value === '' ? undefined : value,
                            {shouldValidate: true}
                        )
                        trigger('categoryId')
                    }}
                    />
                    {errors.categoryId && (
                        <p className="text-sm mt-1">{errors.categoryId.message}</p>
                    )}
            </div>



            {/* Variants */}
            <div className=" bg-gray-50 px-2 py-2 rounded-md outline-indigo-600 outline-2">
                <div className="space-y-4">

                    {/* Add New Empty Variant */}
                    <div className="flex items-center justify-between">
                        <label className="font-medium text-indigo-500">Color Variants</label>
                        <Button
                            type="button"
                            variant={"default"}
                            className="px-4 py-2 hover:bg-indigo-200 cursor-pointer shadow-md"
                            onClick={() => setVariants([
                                ...variants, 
                                {
                                    id: uuidv4(),   // Generate new uuid
                                    name: '',
                                    sku: '',
                                    price: 0,
                                    discount: 0,
                                    stock: 0,
                                    attributes: { color: '' }
                                }
                            ])}
                        >
                            Add Variant
                        </Button>
                    </div>

                    {/* Show Variants */}
                    <div className="space-y-4">
                        {variants.length === 0 ? (
                            <p className="text-center text-rose-500">No variants added yet. click &quot;Add Variant&quot; to create one!!</p>
                        ) : (
                            // Set Variants to variant state Array
                            variants.map((variant) => (
                                <div key={variant.id} className="flex gap-4 justify-center">
                                    {/* Name */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <label htmlFor="variant-price">variant name</label>
                                        <input
                                        type="text"
                                        id="variant-name"
                                        className="p-2 border-gray-200 border rounded w-30"
                                        value={variant.name || ''}
                                        onChange={(e) => updateVariant(variant.id ?? uuidv4(), 'name', e.target.value)}
                                        />
                                    </div>
                                    {/* Color */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <label htmlFor="variant-color">variant color</label>
                                        <input
                                        type="text"
                                        id="variant-color"
                                        className="p-2 border-gray-200 border rounded w-28"
                                        value={variant.attributes?.color || ''}
                                        onChange={(e) => { updateVariantAttribute((variant.id ?? uuidv4()), 'color', e.target.value) }}
                                        />
                                    </div>
                                    {/* Stock */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <label htmlFor="variant-stock">stock</label>
                                        <input
                                        type="number"
                                        placeholder="variant stock"
                                        min={0}
                                        id="variant-stock"
                                        className="p-2 border-gray-200 border rounded w-24"
                                        value={variant.stock || 0}
                                        onChange={(e) => {updateVariant((variant.id ?? uuidv4()), 'stock', Number(e.target.value))}}
                                        />
                                    </div>
                                    {/* Price */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <label htmlFor="variant-price">price</label>
                                        <input
                                        type="number"
                                        placeholder="variant price"
                                        min={0}
                                        step={0.01}
                                        id="variant-price"
                                        className="p-2 border-gray-200 border rounded w-28"
                                        value={variant.price || 0}
                                        onChange={(e) => { updateVariant((variant.id ?? uuidv4()), 'price', Number(e.target.value)) }}
                                        />
                                    </div>
                                    {/* Discount */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <label htmlFor="variant-price">discount</label>
                                        <input
                                        type="number"
                                        placeholder="variant discount"
                                        min={0}
                                        id="variant-discount"
                                        className="p-2 border-gray-200 border rounded w-20"
                                        value={variant.discount || 0}
                                        onChange={(e) => { updateVariant((variant.id ?? uuidv4()), 'discount', Number(e.target.value)) }}
                                        />
                                    </div>
                                    {/* SKU */}
                                    <div className="flex gap-1 items-end justify-center">
                                        <div className="flex-1 min-w-[120px]">
                                            <label className="block text-xs mb-1">sku</label>
                                            <input
                                                type="text"
                                                readOnly={!!variant.sku}
                                                id={`variant-sku-${variant.id}`}
                                                value={variant.sku || ''}
                                                className="w-full p-2 border border-gray-200 rounded-md text-sm h-10"
                                                onChange={(e) => updateVariant(variant.id ?? uuidv4(), 'sku', e.target)}
                                            />
                                        </div>
                                            <button
                                                type="button"
                                                className="text-xs bg-gray-200 px-2 rounded hover:bg-gray-300 h-10 cursor-pointer"
                                                onClick={async () => {
                                                    try {
                                                        const newSku = await generateVariantSKU(variant)
                                                        updateVariant(variant.id ?? uuidv4(),'sku', newSku)
                                                    } catch (error) {
                                                        toast.error('Failed to generate Variant SKU')
                                                        console.error('Variant SKU Error: ', error)
                                                    }
                                                }}
                                            >
                                                Generate
                                            </button>
                                    </div>
                                    {/* Sizes */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <label>size</label>
                                        <input 
                                        type="text" 
                                        id="variant-size"
                                        className="w-20 p-2 border border-gray-200"
                                        value={variant.attributes?.size || ''}
                                        onChange={(e) => {updateVariantAttribute((variant.id ?? uuidv4()), 'size', e.target.value)}
                                        }
                                        />
                                    </div>
                                    {/* Default radio */}
                                    <div className="flex flex-col items-center text-xs justify-center text-justify">
                                        <label htmlFor={`variant-default-${variant.id}`}>Set as default variant</label>
                                        <input
                                        type="radio"
                                        name="defaultVariant"
                                        id={`variant-default-${variant.id}`}
                                        className="p-2 border-gray-200 border rounded"
                                        checked={variant.isDefault || false}
                                        onChange={() => {
                                            setVariants(prevVariants => 
                                                prevVariants.map(v => ({
                                                    ...v,
                                                    isDefault: v.id === variant.id  // Only true for the selected variant
                                                }))
                                            )
                                        }}
                                        />
                                    </div>

                                    {/* remove */}
                                    <button
                                        onClick={() => {
                                            setVariants(variants.filter(v => v.id !== variant.id))
                                        }}
                                        className="text-xs bg-red-500 rounded px-2 py-1 text-white cursor-pointer hover:bg-red-600"
                                    >
                                        remove
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* SKU Generation */}
            <div className="mt-4">
                    <label className="block mb-1 font-normal text-sm ">SKU*</label>
                    <div className="flex gap-2 h-8 mb-2">
                        <input 
                            {...register('sku', {required: 'SKU is required'})}
                            className={`w-full h-full p-2 border rounded-md ${
                                errors.sku ? 'border-red-500' : ''
                            }`}
                            placeholder="Will be auto-generated"
                            readOnly={!!defaultValues?.sku}
                        />
                        {!defaultValues?.sku && (
                            <button
                                type="button"
                                onClick={async () => {
                                    const name = watch('name')
                                    if (name) {
                                        try {
                                            const baseSku = await generateSKU(name, watch('categoryId') || null)
                                            setValue('sku', baseSku, {shouldValidate: true})
                                        } catch (error) {
                                            toast.error('Failed to generate SKU')
                                            console.error('SKU Generation Error: ', error)
                                        } 
                                    } else {
                                        toast.warning('Please enter a product name first')
                                    }
                                }}
                                className="bg-gray-200 h-full px-2 rounded hover:bg-gray-300"
                            >
                                Generate
                            </button>
                        )}
                    </div>
                    {errors?.sku && (
                        <p className="text-red-500 text-sm mt-1">{errors.sku.message}</p>
                    )}
            </div>

            {/* Price Field */}
            <div>
                <label htmlFor="price" className="block mb-2 font-medium">Price*</label>
                <input
                id="price"
                type="number"
                step={'0.01'}
                min={'0.01'}
                {...register('price', {valueAsNumber: true})}
                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
                 />
                 {errors.price && (
                    <p className="text-sm mt-1 text-red-600">{errors.price.message}</p>
                 )}
            </div>

            {/* Stock Field */}
            <div>
                <label htmlFor="stock" className="block mb-2 font-medium">Stock*</label>
                <input
                id="stock"
                type="number"
                min={'0'}
                {...register('stock')}
                className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0"
                 />
                 {errors.stock && (
                    <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                 )}
            </div>
            
            {/* Free-Shipping & 30 Day Guarantee */}
            <div className="flex items-center gap-10">
                {/* Free Shipping */}
                <div className="flex items-center gap-1">
                    <input
                        type="checkbox"
                        id="free-shipping"
                        className="size-4"
                        {...register('hasFreeShipping')}
                    />
                    <label htmlFor="free-shipping">Free Shipping</label>
                </div>
                {/* 30-Day Guarantee */}
                <div className="flex items-center gap-1">
                    <input
                        type="checkbox"
                        id="30-day-guarantee"
                        className="size-4"
                        {...register('returnGuarantee')}
                     />
                     <label htmlFor="30-day-guarantee">30 day Guarantee</label>
                </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
                 <Button 
                 type="submit"
                 disabled={isSubmitting}
                 className={`px-6 py-2 text-white rounded-md cursor-pointer ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                 >
                    {isSubmitting ?
                    'Processing...'
                    : defaultValues?.id ? 'Update Product' : 'Create Poduct'
                    }
                 </Button>


                 <Button
                 type="button"
                 variant={'outline'}
                 onClick={() => router.push('/dashboard/products')}
                 className="px-6 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                 >
                    Cancel</Button>
            </div>
        </div>


        {/* Images Section */}
        <div className="flex-5 justify-end w-full">
            <label className="block mb-6 font-medium ">Product Images</label>
            <ProductImageComponent 
                initialImages={Array.isArray(defaultValues?.images) ? defaultValues.images.filter((img): img is string => !!img) : []}
                onImagesChange={setProductImages}
                viewMode={false}
            />
        </div>


        </form>
     )
}
 
export default ProductForm;