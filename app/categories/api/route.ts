import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

import { withCors, handleOptions } from "@/lib/cors";

export function OPTIONS() {
  return handleOptions();
}


async function getAllCategoryIds(categoryId: string): Promise<string[]> {
    const children = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true }
    })

    let ids = [categoryId]
    for (const child of children) {
        const childIds = await getAllCategoryIds(child.id) // recursion
        ids = ids.concat(childIds)
    }
    return ids
}

export async function GET(req: Request) {

    try {
        const { searchParams } = new URL(req.url)
        const categoryParam = searchParams.get('category') || ""

        // For managing Pagination
        const page = Number(searchParams.get('page')) || 1
        const limit = Number(searchParams.get('limit')) || 10
        const skip = (page - 1) * limit

        const category = await prisma.category.findUnique({
            where: { slug: categoryParam },
            select: { id: true }
        })

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404})
        }

        const allCategoryIds = await getAllCategoryIds(category.id)

        const products = await prisma.product.findMany({
            where: { categoryId: { in: allCategoryIds } },
            skip,
            take: limit
        })

        return withCors(NextResponse.json(products))
    } catch (error) {
        console.error("Error fetching certain category(SERVER): ", error)
        return NextResponse.json({ error: 'Error fetching category(SERVER)' }, { status: 500 })
    }
}