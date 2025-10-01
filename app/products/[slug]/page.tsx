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

export const revalidate = 1

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
            ProductShipping: true,
            reviews: { 
                include: {
                    user: true
                }
            }
        }
    })

    if (!product) return notFound()

    console.log('Category ID is: ', product.categoryId)

    
    const sanityData =  await client.fetch(productByIdQuery, { id: product.sanityId })
    if (!sanityData) return notFound()



    const transformedProduct = {
        id: product.id,
        name: sanityData?.name ?? "",
        slug: sanityData?.slug || '',
        price: product.price ?? 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WishlistItem: (product.WishlistItem ?? []).map((item: any) => ({ userId: item.userId })),
        description: sanityData?.richDescription,
        noSpaceBetweenRichImages: sanityData?.noSpaceBetweenRichImages,
        specs: sanityData?.specs || [],
        stock: product.stock ?? 0,
        discountPercentage: product.discountPercentage ?? 0,
        originalPrice: product.originalPrice ?? 0,
        averageRating: product.averageRating,
        images: product.images ?? [],
        category: product.category ? { name: product.category.name, id: product.categoryId } : undefined,
        categoryId: product.categoryId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reviews: (product.reviews ?? []).map((review: any) => ({
            id: review.id,
            name: review.name ?? review.user?.name ?? "",
            rating: review.rating ?? 0,
            title: review.title ?? "",
            comment: review.comment ?? "",
            approved: review.approved ?? false,
            isChecked: review.isChecked ?? false,
            createdAt: review.createdAt ?? new Date().toISOString(),
            updatedAt: review.updatedAt ?? new Date().toISOString(),
            product: {
                name: sanityData?.name ?? "",
                price: product.price ?? 0,
                stock: product.stock ?? 0,
                images: product.images ?? [],
                whatsInTheBox: typeof sanityData?.whatsInTheBox === "object" && sanityData?.whatsInTheBox !== null
                    ? sanityData?.whatsInTheBox
                    : { html: "", text: "", images: [] },
                sku: review.sku ?? "",
                averageRating: product.averageRating ?? 0,
                description: sanityData?.richDescription ?? "",
                specs: sanityData?.specs ?? [],
                discountPercentage: product.discountPercentage ?? 0,
                originalPrice: product.originalPrice ?? 0,
                category: product.category ? { name: product.category.name, id: product.categoryId } : undefined,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                variants: (product.variants ?? []).map((variant: any) => ({
                    id: variant.id,
                    name: variant.name,
                    price: variant.price,
                    stock: variant.stock,
                    sku: variant.sku,
                    attributes: variant.attributes,
                    isDefault: variant.isDefault ?? undefined,
                    discount: variant.discount ?? undefined,
                    stripePriceId: variant.stripePriceId ?? ""
                })),
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
            },
            user: review.user
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variants: (product.variants ?? []).map((variant: any) => ({
            id: variant.id,
            name: variant.name,
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku,
            attributes: {
                color: variant.attributes?.color,
                size: variant.attributes?.size
            },
            stripePriceId: variant.stripePriceId ?? "",
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