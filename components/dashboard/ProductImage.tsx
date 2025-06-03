
'use client'

import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import {ChevronLeft, ChevronRight} from 'lucide-react'


interface ProductImageProps{
    initialImages?: string[]
    onImagesChange?: ( urls: string[] ) => void
    viewMode?: boolean
}

const ProductImageComponent = ({initialImages = [], onImagesChange, viewMode}: ProductImageProps) => {

    const [images, setImages] = useState<string[]>(initialImages)
    const [isUploading, setIsUploading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(images[0] || null) // Track the slected image

    const [currentImageIndex, setCurrentImageIndex] = useState(0) // for moving through images in the bigger Modal View

    const goToNext = () => {
        setCurrentImageIndex((prev) => {

            const newIndex = prev === images.length - 1 ? 0 : prev + 1
            setSelectedImage(images[newIndex])
            return newIndex
        })
    } 

    const goToPrev = () => {
        setCurrentImageIndex((prev) => {
            const newIndex = prev === 0 ? images.length - 1 : prev - 1
            setSelectedImage(images[newIndex])
            return newIndex
        })
    }

    useEffect(() => {
        if (selectedImage) {
            const index = images.indexOf(selectedImage)
            if (index !== -1) setCurrentImageIndex(index)
        }
    }, [images, selectedImage])

    // For Uploading Product Images to the Cloudinary
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        setIsUploading(true)

        try {
            const uploadedUrls = await Promise.all(
                Array.from(files).map(async (file) => {
                    const formData = new FormData()
                    formData.append('file', file)

                    const res = await axios.post('/dashboard/products/api/images/upload', formData)
                    return res.data.url  // URL from my server
                })
            )

            const newImages = [...images, ...uploadedUrls]
            setImages(newImages)
            onImagesChange?.(newImages)
            if (!selectedImage) setSelectedImage(newImages[0])
        } finally {
            setIsUploading(false)
        }
    }



    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        setImages(newImages)
        onImagesChange?.(newImages)
        if (selectedImage === images[index]) {
            setSelectedImage(newImages[0] || null) // Update selected image if the removed image was selected
        }
    }



    return ( 
        <div className={viewMode ? 'flex flex-row-reverse gap-4 justify-end p-2' :`space-y-4`}>

            <Dialog>
            <DialogTrigger asChild>
                {/* Large Image Display */}
                <div className={viewMode ? 'relative w-[450px] h-[450px]' : "h-[18rem] w-full relative"}>
                    {selectedImage ? (
                        <Image 
                        src={selectedImage}
                        alt="Selected Product"
                        fill
                        priority
                        className="object-contain cursor-pointer"
                        // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <p className="text-4xl font-bold">No Images Selected!</p>
                    )}                   
                </div>
                </DialogTrigger>

                <DialogContent className="max-w-[90vw] max-h-[90vh] sm:max-w-[60vw] sm:max-h-[80vh] bg-white "> 
                    <DialogTitle>Product Image</DialogTitle>
                    <div className="relative w-full h-[70vh]">
                    {selectedImage && (
                        <>
                        <Image
                        src={images[currentImageIndex]}
                        alt="Enlarged Product View"
                        fill
                        className="object-contain p-2"
                        />
                        <button className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/10 p-4 rounded shadow-md hover:bg-white cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            goToPrev()
                        }}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 rounded shadow-md hover:bg-white cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation()
                            goToNext()
                        }}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        </>
                    )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Smaller Images */}
            <div> 
                <div className={viewMode ? 'flex flex-col gap-1 max-h-[400px] overflow-y-auto' : `flex flex-wrap gap-2 max-w-full overflow-hidden justify-start`}>
                    {images.map((url, index) => (
                        <div key={url} className={viewMode ? "group relative h-12 w-12 cursor-pointer" : "group relative h-18 w-18 min-w-[4rem] flex-shrink-0"}>
                            <Image
                                src={url}
                                fill // Fill Container
                                alt="Product review"
                                className={`rounded border object-cover cursor-pointer ${viewMode && 'hover:border-blue-600 hover:outline-1'}`}
                                onClick={() => setSelectedImage(url)}
                                onMouseOver={viewMode ? () => setSelectedImage(url) : undefined}
                            />
                            {!viewMode && (
                                <Button
                                variant={'destructive'}
                                size={'sm'}
                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100
                                transition-opacity shadow-md border cursor-pointer text-red-600 rounded-full text-sm p-0 h-5 w-5"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeImage(index)}
                                }
                                >
                                x
                            </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>


            { !viewMode && (
            <div>
                <input 
                    type="file"
                    id="product-images"
                    multiple
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={isUploading}
                    className="hidden"
                />
                <label
                    htmlFor="product-images"
                    className={`inline-block px-4 py-2 border rounded cursor-pointer 
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                    {isUploading ? 'Uploading...' : 'Add Images'}
                </label>
            </div>
            )}
        </div>
     )
}
 
export default ProductImageComponent;