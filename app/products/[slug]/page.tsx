import ProductDetails from "@/components/productDetails"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"


interface ProductPageProps {
    params: {
        slug: string
    }
}


export default async function ProductPage({params}:ProductPageProps) {
    const product = await prisma.product.findFirst({
        where: {slug: params.slug},
        include: {
            category: true
        }
    })

    if (!product) return notFound()

    const transformedProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug || '',
        price: product.price,
        description: product.description,
        stock: product.stock,
        discountPercentage: product.discountPercentage ?? 0,
        originalPrice: product.originalPrice ?? 0,
        averageRating: product.averageRating,
        images: product.images,
        category: product.category ? { name: product.category.name } : undefined
    }

    return (
        <div className="md: max-w-7xl lg:max-w-screen mx-auto p-4">
            <ProductDetails product={transformedProduct} />
        </div>
    )
}