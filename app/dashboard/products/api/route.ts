import {prisma} from "@/lib/db";
import { generateSKU } from "@/lib/sku-generator";
import { createSanityProductDoc } from "@/sanity/lib/server";
import { NextResponse } from "next/server";
import slug from "slug";

// GET all product server code
export async function GET(req: Request) {

    const {searchParams} = new URL(req.url)
    const includeCategory = searchParams.get('includeCategory') === 'true'
    try {
        const products = await prisma.product.findMany({
            include: {
                category: includeCategory, // Only include if requested
                variants: true,
                WishlistItem: true
            },
        })
        if (!products) return {error: 'No products Found'}

        // Convert to JSON-Safe Format
        const safeProducts = JSON.parse(JSON.stringify(products))
        return NextResponse.json(safeProducts)
    } catch {
        return NextResponse.json({
            error: 'Failed to fetch products'
        } , {status: 500})
    }
}



// POST new product to the products table in the Database
export async function POST(request: Request) {

    try {
        const body = await request.json()

        const sluggedName = body.slug ||  slug(body.name, { lower: true })

        const sanityId = await createSanityProductDoc(body.name, sluggedName)
        
        // Validate required fields
        if (!body.name || body.price === undefined || !body.categoryId) {
            return NextResponse.json({
                error: 'Name, price, and categoryId are required'
            }, {status: 400})
        }

        const productData = {
            name: body.name || 'Untitled',
            sanityId: sanityId || '',
            slug: sluggedName || '',
            description: body.description || '',
            sku: await generateSKU(body.name, body.categoryId || null, null),
            price: parseFloat(body.price) || 0,
            stock: parseInt(body.stock) || 0,
            images: body.images || [],
            variants: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                create: body.variants.map((v: any) => ({
                    name: v.name,
                    sku: v.sku,
                    price: v.price,
                    stock: v.stock,
                    isDefault: v.isDefault,
                    attributes: v.attributes
                }))
            },
            ...(body.categoryId && { categoryId: body.categoryId }), // Only include if exists
            whatsInTheBox: body.whatsInTheBox,
            ProductShipping: body.ProductShipping
                ? {
                    create: {
                    shipsIn: body.ProductShipping?.shipsIn ?? "",
                    shipsFrom: body.ProductShipping?.shipsFrom ?? "",
                    shipsTo: body.ProductShipping?.shipsTo ?? "",
                    carrier: body.ProductShipping?.carrier ?? "",
                    estimatedTime: body.ProductShipping?.estimatedTime ?? "",
                    cost: body.ProductShipping?.cost ?? 0,
                    trackingNote: body.ProductShipping?.trackingNote ?? "",
                    },
                }
            : undefined,
        }

        const product = await prisma.product.create({
            data: productData,
            include: {
                variants: true,
                ProductShipping: true
            }
        })

        // Convert to JSON-safe format
        const safeProduct = JSON.parse(JSON.stringify(product))
        
        return NextResponse.json(
            { success: true, productId: safeProduct?.id ?? null, product: safeProduct },
            { status: 201 }
        )
    } catch (error) {
        console.error('Creation error: ', error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal server error',
            details: error instanceof Error ? error.stack : null
        },{status: 500})
    }
}