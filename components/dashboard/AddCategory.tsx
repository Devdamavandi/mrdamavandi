

import { CategorySchema } from "@/types/zod";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { useCategories, useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import NestedCategorySelect from "./NestedSelect";
import { useState } from "react";
import Image from "next/image";
import axios from "axios";


interface CategoryFormProps {
    defaultValues?: CategorySchema
}

const AddCategoryForm = ({defaultValues}: CategoryFormProps) => {

    const {data: categories} = useCategories()
    const {mutate: createCategory} = useCreateCategory()
    const {mutate: updateCategory} = useUpdateCategory()

    // for storing Category image
    const [image, setImage] = useState<string | null>(null)

    // For storing the Uploading State
    const [isUploading, setIsUploading] = useState(false)
   
    const router = useRouter()

    // Setting default values for Form Value
    const {handleSubmit, register, formState: {errors}, setValue, reset, watch, trigger} = useForm<CategorySchema>({
        defaultValues: defaultValues || {
            name: '',
            slug: '',
            image: '',
            parentId: undefined
        }
    })

    // For Displaying the Chosen Category Cover
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsUploading(true)
        const file = e.target.files
        if (!file || file.length === 0) return

        try {
            const formData = new FormData();
            formData.append('file', file[0]); // Use file[0] to access the first file

            const res = await axios.post('/dashboard/categories/api/image/upload', formData);
            const uploadedUrl = res.data.url; // URL from my server
            setImage(uploadedUrl); // Set the uploaded URL as the image
            
        } finally {
            setIsUploading(false)
        }
    }


    // Finally Submit Category data to The Hooks
    const onSubmit = async (data: CategorySchema) => {
        try {
            const payload = {
                ...data,
                image: image || ""
            }

            if (defaultValues?.id) {
                await updateCategory({ 
                    ...payload,
                    id: defaultValues.id,
                    parentId: data.parentId || undefined // Match the schema type
                  })
                toast.success('Category Updated!')
            } else {
                await createCategory({
                    ...payload,
                    parentId: data.parentId || undefined
                })
                reset()
                toast.success('Category Created!')
                setImage(null)
                router.refresh()
            }
            router.refresh()
            setIsUploading(true)
        } catch (error) {
            console.error('Submission error: ', error)
            toast.error(defaultValues?.id ? 'failed to update category' : 'failed to create category')
        }
    }

    return ( 
        <form onSubmit={handleSubmit(onSubmit)} className="w-10/12 mt-10 bg-white shadow h-fit gap-2 flex flex-col p-2 ">
            <input id="name" {...register('name')} placeholder="Enter Category Name" className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
            <input id="slug" {...register('slug')} placeholder="Enter Category Slug" className={`w-full p-2 border rounded-md ${errors.slug ? 'border-red-500' : 'border-gray-300'}`} />

            <NestedCategorySelect 
                categories={categories || []}
                value={watch('parentId') || ''}
                onChange={(value) => {
                    setValue('parentId', value === '' ? undefined : value, {shouldValidate: true});
                    trigger('parentId');
                }}
            />

            {/* Category Cover Image Upload */}
            <div className="w-[300px]">
                <input 
                    type="file"
                    id="category-images"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleUpload}
                    className="hidden"
                 />
                 <label htmlFor="category-images"
                 className={`inline-block px-4 py-2 my-2 shadow-md rounded cursor-pointer
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                    `}
                 >
                    {!isUploading && 'Add Image'}
                 </label>
                 {image &&
                    <Image 
                    src={image}
                    width={40}
                    height={40}
                    alt={defaultValues?.name || 'category-name'}
                 />}
            </div>
            
            <Button 
            className="w-1/2 bg-blue-500 hover:bg-blue-600 cursor-pointer text-white" 
            type="submit"

            >
                Add
                </Button>
        </form>
     )
}
 
export default AddCategoryForm;