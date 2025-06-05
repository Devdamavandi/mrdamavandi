import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(){
  try {
    // Get only parent categories (where parentId is null) with thier direct product counts
    const parents = await prisma.category.findMany({
      where: {parentId: null},
      include: {
        _count: {
          select: {products: true}
        },
      },
      orderBy: {
        name: 'asc'
      },
    })

    const simplifiedParents= parents.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      productCount: category._count.products
    }))
    return NextResponse.json(simplifiedParents)
  } catch (error) {
    console.error('failed fetching categories: ', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, {status: 500})
  }
}
