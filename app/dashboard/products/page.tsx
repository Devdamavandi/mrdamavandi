

'use client'

import ColumnSettingsComponent from "@/components/dashboard/columns";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDeleteProduct, useProducts } from "@/hooks/useProducts";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoIosSettings } from "react-icons/io";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
 } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import TopNavigationNav from "@/components/dashboard/top-nav";

interface ProductProps {
    id?: string
    name: string
    description?: string
    stock: number
    category?: {id: string , name: string}
    price: number
    createdAt?: Date | string
    images?: (string | undefined)[]
}


const ProductsPage = () => {

    // For handling Search Query
    const [searchTerm, setSearchTerm] = useState('')

    // for Show/Hide Columns from setting
    const [visibleColumns, setVisibleColumns] = useState<string[]>([ 'Category'])

    // for Pagination implementation
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    const {data: products, isLoading, error} = useProducts()
    const {mutate: deleteProduct} = useDeleteProduct()

    const router = useRouter()

    useEffect(() => {
        router.refresh()
    },[])

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error: {error.message}</div>


    // Filter products based on search term
    const filteredProducts = products?.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())) || []

    // Pagination logic
    const totalProducts = filteredProducts.length
    const totalPages = Math.ceil(totalProducts / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + rowsPerPage)


    // This part is for toggle new columns to the table
    const toggleColumn = (col: string) => {
        setVisibleColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]) 
    }


    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return ( 
        <div className="">

            <TopNavigationNav />

            {/* Settings Section */}
            <div className="flex justify-end mt-4 mb-2">
            <Popover>
                <PopoverTrigger asChild>
                    <IoIosSettings size={26} className="cursor-pointer"/>
                </PopoverTrigger>
                <PopoverContent className="w-80 z-10 bg-white">
                    <div className="space-y-2">
                        <h1 className="font-bold">Table Settings</h1>
                        <p className=" text-gray-400 text-sm ">Set the table properties here</p>
                        <h2>Show/Hide Columns</h2>
                        <ColumnSettingsComponent visibleColumns={visibleColumns}   onToggleColumn={toggleColumn}/>

                        <div className="pt-2">
                            <label>Rows per page</label>
                            <select 
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(Number(e.target.value))
                                setCurrentPage(1) // reset to first page when changing rows per page
                            }}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md cursor-pointer"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            </div>


            {/* A Top section for adding products */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Products</h1>
                <Link href='/dashboard/products/create'
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
                >
                    Add Product
                </Link>
            </div>


                {/* Search Input */}
            <div className="relative mb-4">
                <input type="text"
                placeholder="search products..."
                className="w-full p-2 border rounded-md pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {/* Search Icon */}
                     <svg 
    className="absolute left-2 top-4 h-4 w-4 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
            </div>

            

            {/* Products Table Section */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    {/* head section of the table */}
                    <thead>
                        <tr>
                            <th className="py-2 px-4 bg-blue-50 text-blue-800">#</th>
                            <th className="py-2 px-4 bg-blue-50 text-blue-800">Image</th>
                            <th className="py-2 px-4 bg-blue-50 text-blue-800">Name</th>
                            {visibleColumns.includes('Description') && (
                                <th className="py-2 px-4 bg-blue-50 text-blue-800">Description</th>
                            )}
                            <th className="py-2 px-4 bg-blue-50 text-blue-800">Price</th>
                            <th className="py-2 px-4 bg-blue-50 text-blue-800">Stock</th>
                            {visibleColumns.includes('Category') && (
                                <th className="py-2 px-4 bg-blue-50 text-blue-800">Category</th>)}
                            {visibleColumns.includes('Created At') && (
                                <th className="py-2 px-4 bg-blue-50 text-blue-800">Created At</th>
                            )}
                            <th className="py-2 px-4 bg-blue-50 text-blue-800">Actions</th>
                        </tr>
                    </thead>

                    {/* Body section of the table */}
                    <tbody>
                        {paginatedProducts?.map((product: ProductProps, index) => (
                            <tr key={product.id} className="hover:bg-gray-50 border-b-gray-200/65 border-b-[1px]">
                                <td className="py-2 px-4 bg-blue-50/30">{index + 1}</td>
                                <td className="py-2 px-4 bg-blue-50/30 text-center">{product.images?.[0] ? (
                                     <div className="relative w-16 h-16">
                                        <Image 
                                        src={product.images[0] || '/default-image.jpg'}
                                        alt={product.name}
                                        fill 
                                        sizes="100%"
                                        className="object-contain rounded"
                                        />
                                    </div>   
                                ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded">No image</div>
                                )}
                                </td>
                                <td className="py-2 px-4 bg-blue-50/30">
                                    <Link href={`/dashboard/products/${product.id}`}>
                                        {product.name}
                                    </Link>
                                    </td>
                                {visibleColumns.includes('Description') && (
                                    <td className="py-2 px-4 bg-blue-50/30">{product.description || '-'}</td>
                                )}
                                <td className="py-2 px-4 bg-blue-50/30 text-center">{product.price}</td>
                                <td className="py-2 px-4 bg-blue-50/30 text-center">{product.stock}</td>
                                {visibleColumns.includes('Category') && (
                                    <td className="py-2 px-4 bg-blue-50/30 text-center">{product.category?.name || '-'}</td>)}
                                {visibleColumns.includes('Created At') && (
                                <td className="py-2 px-4 bg-blue-50/30 text-center">
                                    {product.createdAt instanceof Date ? product.createdAt.toLocaleDateString() : product.createdAt}
                                </td>
                            )}
                                <td className="py-2 px-4 bg-blue-50/30 text-center">
                                    <Link href={`/dashboard/products/edit/${product.id}`}
                                    className="text-blue-500 mr-2 text-center"
                                    >
                                        Edit
                                    </Link>
                                    {/* Delete Button */}
                                    <Button variant={'destructive'}
                                     size={'sm'}
                                     className="bg-red-500 hover:bg-red-600/95 cursor-pointer"
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this product?')) {
                                            deleteProduct(product.id!)
                                        }
                                    }}
                                     >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


            {/* Pagination Component */}
            <Pagination className="mt-4">
                <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                href="#"
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (currentPage > 1) handlePageChange(currentPage - 1);
                                }}
                            />
                        </PaginationItem>

                        {/* page Numbers implement */}
                        {Array.from({ length: Math.min(5, totalPages) } , (_, i) => {
                            let pageNum
                            if (totalPages <= 5) {
                                pageNum = i + 1
                            } else if (currentPage <= 3) {
                                pageNum = i + 1
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                            } else {
                                pageNum = currentPage - 2 + i
                            }

                            return (
                                <PaginationItem key={pageNum}>
                                    <PaginationLink
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        handlePageChange(pageNum)
                                    }}
                                    isActive={pageNum === currentPage}
                                    className="hover:bg-gray-100"
                                    >
                                        {pageNum}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        })}

                        <PaginationItem>
                            <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (currentPage < totalPages) handlePageChange(currentPage + 1)
                                }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                        
                </PaginationContent>
            </Pagination>
      
            {/* Page Info */}
                <div className="text-center mt-2 opacity-80">
                Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, totalProducts)} of {totalProducts} products
                </div>
        </div>


     )
}
 
export default ProductsPage;