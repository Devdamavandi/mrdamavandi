import {prisma} from "@/lib/db";
import { generateSKU } from "@/lib/sku-generator";
import { NextResponse } from "next/server";


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

        // Validate required fields
        if (!body.name || body.price === undefined || !body.categoryId) {
            return NextResponse.json({
                error: 'Name, price, and categoryId are required'
            }, {status: 400})
        }

        const variantss = body.variants || []

        /** 👇 This Part is for more security about variants check in Backend 👇 */
       

        // If variants exist, but none is default, make first one default
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const defaultVariants = variantss.filter((v: { isDefault: any; }) => v.isDefault)
        if (variantss.length > 0 && defaultVariants.length === 0) {
            variantss[0].isDefault = true
        } else if (variantss.length > 0 && defaultVariants.length > 1) {
            return NextResponse.json({ error: 'Only one variant can be marked as default!'}, {status: 400})
        }

        // Generate SKUs for variants if missing
        if (variantss.length > 0) {
            for (const variantt of variantss) {
                if (!variantt.sku) {
                    variantt.sku = await generateSKU(
                        body.name,
                        body.categoryId || null,
                        variantt.attributes || {}
                    )
                }
            }
        }
        
        const productData = {
            name: body.name,
            description: body.description || '',
            sku: await generateSKU(body.name, body.categoryId || null, null),
            price: parseFloat(body.price),
            stock: parseInt(body.stock) || 0,
            images: body.images || [],
            variants: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                create: variantss.map((v: any) => ({
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
        
        return NextResponse.json({ success: true ,product: safeProduct}, {status: 201})
    } catch (error) {
        console.error('Creation error: ', error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal server error',
            details: error instanceof Error ? error.stack : null
        },{status: 500})
    }
}