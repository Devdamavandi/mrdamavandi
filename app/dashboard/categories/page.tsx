

'use client'

import { useCategories, useUpdateCategory } from "@/hooks/useCategories";
import { Fragment, useEffect, useState } from "react";
import {Check, X} from 'lucide-react'
import { Button } from "@/components/ui/button";
import { CategorySchema } from "@/types/zod";
import AddCategoryForm from "@/components/dashboard/AddCategory";
import Image from 'next/image'
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";
import TopNavigationNav from "@/components/dashboard/top-nav";

const CategoriesPage = () => {

    const {data: Categories, isLoading, error} = useCategories()
    const {mutate: updateCategory} = useUpdateCategory()

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValues, setEditValues] = useState<{name: string; slug: string; parent: string; parentId: string; image: string | null}>({
        name: '', slug: '', parent: '', parentId: '', image: null
    })


    const [searchTerm, setSearchTerm] = useState('')

    
    // when user clicks out of input boxes, it cancels
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (editingId && !(e.target as HTMLElement).closest('input, button, select, image')) {
                handleCancel()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [editingId])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error Occured: {error.message}</div>


    // Handle Edit Category Functionality
    const handleEdit = (cat: CategorySchema) => {
        setEditingId(cat.id ?? null)
        setEditValues({
            name: cat.name,
            slug: cat.slug,
            image: cat?.image || null,
            parent: cat.parent?.name || '', // For Display
            parentId: cat.parentId || '' // For the actual relation
        })
    }

    // Save input row changes
    const handleSave = (id: string) => {
        updateCategory({
            id,
            name: editValues.name,
            slug: editValues.slug || editValues.name.toLowerCase().replace(/\s+/g, '-'),
            parentId: editValues.parentId || '', // Send null if no parent selected            
            path: []
        })
        setEditingId(null)
    }

    const handleCancel = () => {
        setEditingId(null)
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
        const file = e.target.files
        if (!file || file.length === 0) return  
        
        const category = Categories?.find(cat => cat.id === categoryId)
        if (!category) return toast.error('category not found!!')
        
        try {
            const formData = new FormData()
            formData.append('file', file[0])

            const res = await axios.post('/dashboard/categories/api/image/upload', formData)
            const uploadedUrl = res.data.url
            updateCategory({
                id: categoryId, // Use the current editing ID or an empty string
                image: uploadedUrl,
                name: category.name,
                slug: category.slug,
                parentId: category.parentId || '',
                path: category.path || []
            }) 
            toast.success('Image updated successfully!')
        } catch {
            toast.error('Image upload failed!!')
        }
    } 

    // Filter for SearchBox
    const filteredCategories = Categories?.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase())) || []

    const renderCategoryTree = (categories: CategorySchema[], parentId: string | null = null , level = 0) => {

        return filteredCategories.filter(category => 
        (parentId === null && !category.parentId) || (category.parentId === parentId) 
        )
        .map((category, index) => (
            <Fragment key={category.id}>
                <tr className={ level === 0 ? 'bg-gray-50 font-semibold' : ''}>
                <td className="bg-blue-50/30 text-center">{index + 1}</td>    
                <td className={`py-2 px-3 bg-blue-50/30 text-center ${
                            level === 0 ? "bg-blue-500 text-white" :
                            level === 1 ? "bg-green-300 text-black" :
                            level === 2 ? "bg-orange-200 text-black" : ""
                        }`}>
                            {Array(level).fill(0).map((_, i) => (
                                <span key={i} className={`inline-block w-4`}></span>
                            ))}
                            {level > 0 && '↳ '.repeat(level)}
                            {editingId === category.id ? (
                                <input
                                    value={editValues.name}
                                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                    className="border p-1"
                                />
                            ) : (
                                category.name
                            )}
                        </td>
                        <td className={`py-2 px-2 bg-blue-50/30 text-center ${
                            level === 0 ? "bg-blue-500 text-white" :
                            level === 1 ? "bg-green-300 text-black" :
                            level === 2 ? "bg-orange-200 text-black" : ""
                        }`}>
                            {editingId === category.id ? (
                                <input
                                    value={editValues.slug}
                                    onChange={(e) => setEditValues({ ...editValues, slug: e.target.value })}
                                    className="border p-1"
                                />
                            ) : (
                                category.slug
                            )}
                        </td>
                        <td className={`py-2 px-2 bg-blue-50/30 text-center`}>
                            {editingId === category.id ? (
                                <select
                                    value={editValues.parentId || ''}
                                    onChange={(e) => setEditValues({...editValues, parentId: e.target.value})}
                                    className="border p-1"
                                 >
                                    <option value="">No Parent</option>
                                    {Categories?.filter(c => c.id !== category.id) // Dont allow selecting self as parent
                                        .map(cat => (
                                            <option value={cat.id} key={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            ) : (
                                category.parent?.name || '-' // Show dash if no parent
                            )}
                        </td>
                        <td className={`py-2 px-2 bg-blue-50/30 text-cenetr`}>
                            <div className="flex items-center justify-center gap-2">
                                {category.image ? ( 
                                    <Image src={category.image} alt={category.name} width={40} height={40} />
                                ) : (
                                    <FontAwesomeIcon icon={faImage} size="2x" className="text-gray400" />
                                )}
                                <input 
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id={`file-input-${category.id}`}
                                    onChange={(e) => handleImageChange(e, category.id!)}
                                />
                                <label htmlFor={`file-input-${category.id}`}
                                className="cursor-pointer hover:bg-gray-600 hover:text-white hover:px-1 hover:py-1 text-sm rounded"
                                >
                                    {category.image ? "change" : "add"}
                                </label>
                            </div>    
                           
                        </td>
                        <td className="py-2 px-4 bg-blue-50/30 text-center">
                            {editingId === category.id ? (
                                <>
                                    <Button variant={'ghost'} onClick={() =>  handleSave(category.id!)} className="hover:shadow cursor-pointer">
                                        <Check className="text-green-500" />
                                    </Button>
                                    <Button variant={'ghost'} onClick={handleCancel} className="hover:shadow cursor-pointer">
                                        <X className="text-red-500" />
                                    </Button>
                                </>
                            ) : (
                                    <Button variant={'ghost'} onClick={() => handleEdit(category)} className="cursor-pointer hover:text-gray-600">
                                        Edit
                                    </Button>
                            )}
                        </td>
                    </tr>
                    {renderCategoryTree(categories, category.id, level + 1)}
            </Fragment>
        ))
    }




    return ( 
        <div> 
            <TopNavigationNav/>  
            <div className="mt-8">
                <input type="text"
                    placeholder="search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-10/12 p-2 border rounded-md pl-8 mb-2"
                />
            </div>
            <div className="flex gap-10">
                <table className="w-10/12">
                    {/* Head Section of the table */}
                    <thead>
                        <tr>
                            <th className="py-2 px-4 bg-blue-50 text-blue-800">#</th>
                            <th className="py-2 px-3 bg-blue-50 text-blue-800">Category Name</th>
                            <th className="py-2 px-2 bg-blue-50 text-blue-800">Category Slug</th>
                            <th className="py-2 px-2 bg-blue-50 text-blue-800">Parent</th>
                            <th className="py-2 px-4 bg-blue-50 text-blue-800">Image</th>
                            <th className="py-2 px-4 bg-blue-50 text-blue-800">Action</th>
                        </tr>
                    </thead>
                    {/* Body Section of the table */}
                    <tbody>
                        {renderCategoryTree(Categories || [])}
                    </tbody>
                </table>

                <div className="flex gap-2 mt-10">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-2 bg-blue-500"></span>
                            <p>Blue = Parent Category</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-2 bg-green-300"></span>
                            <p>Green = 1st child</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-2 bg-orange-200"></span>
                            <p>Orange = 2st child</p>
                        </div>
                    </div>
                </div>
            </div>

            
            {/* Add New Category Form */}
            <AddCategoryForm />
        </div>
     )
}
 
export default CategoriesPage;