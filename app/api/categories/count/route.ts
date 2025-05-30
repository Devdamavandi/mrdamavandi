// app/api/categories/count/route.ts
import { prisma } from "@/lib/db";
import { CategorySchema } from "@/types/zod";
import { NextResponse } from "next/server";

function buildHierarchy(categories: CategorySchema[], parentId: string | null = null) {
  return categories
    .filter(category => category.parentId === parentId)
    .map(category => ({
      ...category,
      children: buildHierarchy(categories, category.id)
    }));
}

export async function GET() {
  try {
    // Get all categories with their product counts
    const allCategories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } }
      }
    });

    // Calculate total products including all descendants for each category
    const categoriesWithTotals = allCategories.map(category => {
      const descendants = allCategories.filter(c => 
        c.path.includes(category.id) && c.id !== category.id
      );
      
      const totalProducts = descendants.reduce(
        (sum, descendant) => sum + descendant._count.products,
        category._count.products
      );

      return {
        ...category,
        totalProducts
      };
    });

    // Build the full hierarchy starting from depth=0
    const hierarchicalData = buildHierarchy(categoriesWithTotals);

    return NextResponse.json(hierarchicalData);
  } catch (error) {
    console.error('Error fetching category counts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category counts' },
      { status: 500 }
    );
  }
}