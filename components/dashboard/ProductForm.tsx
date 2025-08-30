
'use client'

import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { ProductFormValues } from "@/types/zod";
import { useRouter } from "next/navigation";
import {useForm} from 'react-hook-form'
import {toast} from 'react-toastify'
import { Button } from "../ui/button";
import { useCategories } from "@/hooks/useCategories";
import ProductImageComponent from "./ProductImage";
import { useEffect, useState } from "react";
import NestedCategorySelect from "./NestedSelect";
import { generateSKU } from "@/lib/sku-generator";
import { VariantFormValues } from "@/types/zod";
import { v4 as uuidv4 } from 'uuid'
import slug from 'slug'
import Link from "next/link";
import { fetchSanityData } from "@/sanity/lib/queries";

interface ProductFormProps {
    defaultValues?: ProductFormValues
}


const ProductForm = ({defaultValues} : ProductFormProps) => {

    
    
    const router = useRouter()
    const { mutate: createProduct, isPending: isCreating} = useCreateProduct()
    const {mutate: updateProduct, isPending: isUpdating} = useUpdateProduct()
    const isSubmitting = isCreating || isUpdating

    const { data: categories} = useCategories()


    const [productImages, setProductImages] = useState<string[]>(Array.isArray(defaultValues?.images) ? defaultValues?.images.filter((img): img is string => !!img) : [])
    const [variants, setVariants] = useState<VariantFormValues[]>(
        defaultValues?.variants?.map(v => ({...v, id: v.id || uuidv4()})) || []
    )

    
    // 1.Initialize RHF with zod Resolver
    const {register, handleSubmit, formState: {errors}, setValue, watch, trigger, reset} = useForm<ProductFormValues>({
        defaultValues: defaultValues ?? {  
            name: '',
            sku: '',
            price: 0,
            stock: 0,
            variants: [],
            categoryId: undefined,
            images: [],
            ProductShipping: {
                shipsIn: '',
                shipsFrom: '',
                shipsTo: '',
                carrier: '',
                estimatedTime: '',
                cost: 0,
                trackingNote: ''
            },
            hasFreeShipping: false,
            returnGuarantee: false
        },
    })

    useEffect(() => {
        if (defaultValues) {
            reset(defaultValues)
        }
    }, [defaultValues, reset])

    useEffect(() => {
        async function syncSanity() {
            if (defaultValues?.sanityId) {
                const sanityData = await fetchSanityData(defaultValues.sanityId)
                if (sanityData) {
                    // Merge Sanity data into your form
                    setValue("slug", sanityData.slug?.current || "")
                    setValue("description", sanityData.richDescription || "")
                }
                console.log("Sanity Data(ProductForm.tsx): ", sanityData)
            }
        }
        syncSanity()
    }, [defaultValues?.sanityId, setValue])
 
    
    // if (!defaultValues) return <div>Loading product data...</div>

    

    // 2.Form submission handler
    const onSubmit = async (data: ProductFormValues) => {

        if (!data.sku) {
            toast.error('Please generate an SKU first!')
            return
        }

        const defaultVariant = variants?.filter(v => v.isDefault)
        if (defaultVariant.length > 1) {
            toast.error('Only one variant can be marked as default')
            return
        }
        
        if (variants.length > 0 && defaultVariant.length === 0) {
            variants[0].isDefault = true
        }

 
        // Convert string numbers to actual numbers
        const processedData = {
            ...data,
            images: productImages,
            price: Number(data?.price),
            stock: Number(data?.stock),
            categoryId: data?.categoryId || undefined,
            variants: variants,
            ProductShipping: {
                shipsIn: data.ProductShipping?.shipsIn ?? '',
                shipsFrom: data.ProductShipping?.shipsFrom ?? '',
                shipsTo: data.ProductShipping?.shipsTo ?? '',
                carrier: data.ProductShipping?.carrier ?? '',
                estimatedTime: data.ProductShipping?.estimatedTime ?? '',
                cost: parseFloat(data.ProductShipping?.cost as unknown as string) || 0,
                trackingNote: data.ProductShipping?.trackingNote ?? ''
            }
        }

        const sluggifiedName = slug(data.name, { lower: true, replacement: '-'})

       try {

      
        if (defaultValues?.id) {
            await updateProduct({...processedData, id: defaultValues?.id})
            toast.success('Product Updated')
        } else {
            await createProduct({
                ...processedData,
                slug: sluggifiedName,
            })
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
            prevVariants?.map(v => 
                v.id === id ? {...v, [field]: value} : v
            ))
    }

    // For Creating or Updating a Variant's Attribute
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateVariantAttribute = (id: string, attr: string, value: any) => {
        setVariants(prevVariants => 
            prevVariants?.map(v => 
                v?.id === id ? {...v, attributes: {...v.attributes, [attr]: value }} : v
            )
        )
    }

    const generateVariantSKU = async (variant: VariantFormValues) => {
        if (variant?.sku && variant?.sku !== '') return variant?.sku

        try {
            return await generateSKU(
                watch('name'),
                watch('categoryId') || null,
                variant?.attributes
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

            {/* Hidden fields for Update Sanity Data to Work! */}
            <input type="hidden" {...register('slug')} />
            <input type="hidden" {...register('description')} />

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

            {/* Category SelectBox */}
            <div className="my-4 mb-6">
                <p className="text-sm mb-2">Select category:</p>
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
                                        <label htmlFor="variant-price" className="text-xs">variant name</label>
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
                                        <label htmlFor="variant-color" className="text-xs">variant color</label>
                                        <input
                                        type="text"
                                        id="variant-color"
                                        className="p-2 border-gray-200 border rounded w-20"
                                        value={variant.attributes?.color || ''}
                                        onChange={(e) => { updateVariantAttribute((variant.id ?? uuidv4()), 'color', e.target.value) }}
                                        />
                                    </div>
                                    {/* Stock */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <label htmlFor="variant-stock" className="text-xs">stock</label>
                                        <input
                                        type="number"
                                        placeholder="variant stock"
                                        min={0}
                                        id="variant-stock"
                                        className="p-2 border-gray-200 border rounded w-18"
                                        value={variant.stock || 0}
                                        onChange={(e) => {updateVariant((variant.id ?? uuidv4()), 'stock', Number(e.target.value))}}
                                        />
                                    </div>
                                    {/* Price */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <label htmlFor="variant-price" className="text-xs">price</label>
                                        <input
                                        type="number"
                                        placeholder="variant price"
                                        min={0}
                                        step={0.01}
                                        id="variant-price"
                                        className="p-2 border-gray-200 border rounded w-18"
                                        value={variant.price || 0}
                                        onChange={(e) => { updateVariant((variant.id ?? uuidv4()), 'price', Number(e.target.value)) }}
                                        />
                                    </div>
                                    {/* Discount */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <label htmlFor="variant-price" className="text-xs text-nowrap">price with discount</label>
                                        <input
                                        type="number"
                                        placeholder="variant discount"
                                        min={0}
                                        step={0.001}
                                        id="variant-discount"
                                        className="p-2 border-gray-200 border rounded w-18"
                                        value={variant.discount || 0}
                                        onChange={(e) => { updateVariant((variant.id ?? uuidv4()), 'discount', Number(e.target.value)) }}
                                        />
                                    </div>
                                    {/* SKU */}
                                    <div className="flex gap-1 items-end justify-center">
                                        <div className="flex-1 min-w-[120px]">
                                            <label className="block text-xs mb-1 text-center">sku</label>
                                            <input
                                                type="text"
                                                readOnly={!!variant.sku}
                                                id={`variant-sku-${variant.id}`}
                                                value={variant.sku || ''}
                                                className="w-full p-2 border border-gray-200 rounded-md text-sm h-10"
                                                onChange={(e) => updateVariant(variant.id ?? uuidv4(), 'sku', e.target.value)}
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
                                        className="w-12 p-2 border border-gray-200"
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
                step='0.01'
                min='1'
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
            
            {/* Free-Shipping & 30 Day Guarantee CheckBoxes */}
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

            {/* Shipping Info Entry */}
            <div className="flex flex-col">
                 <input 
                    type="text"
                    placeholder="Ships in"
                    id="shipsin"
                    {...register('ProductShipping.shipsIn')}
                    className="p-2 mb-2 border border-gray-300 rounded-md w-1/2"
                  />
                 <input 
                    type="text"
                    placeholder="Ships To"
                    id="shipsto"
                    {...register('ProductShipping.shipsTo')}
                    className="p-2 mb-2 border border-gray-300 rounded-md w-1/2"
                  />
                 <input 
                    type="text"
                    placeholder="Shipping Estimated time"
                    {...register('ProductShipping.estimatedTime')}
                    className="p-2 mb-2 border border-gray-300 rounded-md w-1/2"
                  />
                 <input 
                    type="text"
                    placeholder="shipping cost"
                    {...register('ProductShipping.cost')}
                    className="p-2 mb-2 border border-gray-300 rounded-md w-1/2"
                  />
                 <input 
                    type="text"
                    placeholder="shipping carrier"
                    {...register('ProductShipping.carrier')}
                    className="p-2 mb-2 border border-gray-300 rounded-md w-1/2"
                  />
            </div>

            {/* Edit Product Sanity Data */}
            <div>
                {defaultValues?.sanityId && (
                    <Link
                    href={`/studio/structure/productContent;${defaultValues.sanityId}`}
                    target="_blank"
                    className="text-blue-500 hover:underline"
                    >Edit other data</Link>
                )}
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