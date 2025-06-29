import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import dynamic from "next/dynamic"

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
            WishlistItem: true
        }
    })

    if (!product) return notFound()

    const transformedProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug || '',
        price: product.price,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WishlistItem: (product.WishlistItem ?? []).map((item: any) => ({ userId: item.userId })),
        description: product.description,
        stock: product.stock,
        discountPercentage: product.discountPercentage ?? 0,
        originalPrice: product.originalPrice ?? 0,
        averageRating: product.averageRating,
        images: product.images,
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
        whatsInTheBox: (() => {
            if (
                typeof product.whatsInTheBox === 'object' &&
                product.whatsInTheBox !== null &&
                'html' in product.whatsInTheBox &&
                'text' in product.whatsInTheBox
            ) {
                // Ensure images is optional and is an array if present
                const { html, text, images } = product.whatsInTheBox as { html: string; text: string[]; images?: string[] };
                return {
                    html: typeof html === 'string' ? html : '',
                    text: Array.isArray(text) ? text : [],
                    ...(Array.isArray(images) ? { images } : {})
                };
            }
            return { html: '', text: [] };
        })(),
        hasFreeShipping: product.hasFreeShipping ?? false,
        returnGuarantee: product.returnGuarantee ?? false
    }

    return (
        <div className="md: max-w-7xl lg:max-w-screen mx-auto p-4">
            <ProductDetails product={transformedProduct} />
        </div>
    )
}