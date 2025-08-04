import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import { client } from "@/sanity/lib/client"
import { productByIdQuery } from "@/sanity/lib/queries"


interface ProductPageProps {
    params: {
        slug: string
    }
}

const ProductDetails = dynamic(() => import('@/components/productDetails'), { ssr: true })
export default async function ProductPage({params}:ProductPageProps) {

    const {slug} = await params
    
    const product = await prisma.product.findUnique({
        where: {slug},
        include: {
            category: {
                select: { name: true }
            },
            variants: true,
            WishlistItem: true,
            ProductShipping: true
        }
    })

    if (!product) return notFound()

    
    const sanityData =  await client.fetch(productByIdQuery, { id: product.sanityId })
    if (!sanityData) return notFound()



    const transformedProduct = {
        id: product.id,
        name: sanityData?.name,
        slug: sanityData?.slug || '',
        price: product.price,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WishlistItem: (product.WishlistItem ?? []).map((item: any) => ({ userId: item.userId })),
        description: sanityData?.richDescription,
        stock: product.stock,
        discountPercentage: product.discountPercentage ?? 0,
        originalPrice: product.originalPrice ?? 0,
        averageRating: product.averageRating,
        images: product.images ?? [],
        category: product.category ? { name: product.category.name } : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variants: (product.variants ?? []).map((variant: any) => ({
            id: variant.id,
            name: variant.name,
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku,
            attributes: variant.attributes,
            isDefault: variant.isDefault ?? undefined,
            discount: variant.discount ?? undefined
        })),
        whatsInTheBox: sanityData?.whatsInTheBox || [],
        hasFreeShipping: product.hasFreeShipping ?? false,
        returnGuarantee: product.returnGuarantee ?? false,
        ProductShipping: product.ProductShipping
            ? {
                shipsIn: product.ProductShipping.shipsIn,
                shipsFrom: product.ProductShipping.shipsFrom,
                shipsTo: product.ProductShipping.shipsTo,
                estimatedTime: product.ProductShipping.estimatedTime,
                carrier: typeof product.ProductShipping.carrier === "string" ? product.ProductShipping.carrier : "",
                trackingNote: typeof product.ProductShipping.trackingNote === "string" ? product.ProductShipping.trackingNote : "",
                cost: typeof product.ProductShipping.cost === "number" ? product.ProductShipping.cost : 0
            }
            : {
                shipsIn: "",
                shipsFrom: "",
                shipsTo: "",
                estimatedTime: "",
                carrier: "",
                trackingNote: "",
                cost: 0
            }
    }


    return (
        <div className="md: max-w-7xl lg:max-w-screen mx-auto p-4">
            <ProductDetails product={transformedProduct} />
        </div>
    )
}