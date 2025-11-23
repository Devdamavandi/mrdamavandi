import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

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
    const childIds = await getAllCategoryIds(child.id)
    ids = ids.concat(childIds)
  }

  return ids
}




export async function GET(){
  try {
    // Get Only Top-Level Categories
    const parents = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' }
    })

    const categoriesWithCounts = await Promise.all(
      parents.map(async (category) => {
        const allCategoryIds = await getAllCategoryIds(category.id)
        const productCount = await prisma.product.count({
          where: { categoryId: { in: allCategoryIds } }
        })
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          image: category.image,
          productCount,
        }
      })
    )
    
    return withCors(NextResponse.json(categoriesWithCounts))
  } catch (error) {
    console.error('failed fetching categories: ', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, {status: 500})
  }
}
