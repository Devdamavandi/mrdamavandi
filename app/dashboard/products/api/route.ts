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
                category: includeCategory // Only include if requested
            },
        })
        if (!products) return {error: 'No products Found'}
        return NextResponse.json(products)
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

        // Validate reequired fields
        if (!body.name || body.price === undefined || !body.categoryId) {
            return NextResponse.json({
                error: 'Name, price, and categoryId are required'
            }, {status: 400})
        }

        const sku = await generateSKU(body.name, body.categoryId || null)

        const productData = {
                name: body.name,
                description: body.description || '',
                sku,
                price: parseFloat(body.price),
                stock: parseInt(body.stock) || 0,
                images: body.images || [],
                ...(body.categoryId && { categoryId: body.categoryId }) // Only include if exists
        }

        console.log('Processed data:', productData); // Debug log

        const product = await prisma.product.create({
            data: productData
        })

        console.log('Created product:', product); // Debug log

        return NextResponse.json(product, {status: 201})
    } catch (error) {
        console.error('Creation error: ', error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Creation failed'
        },{status: 500})
    }
}