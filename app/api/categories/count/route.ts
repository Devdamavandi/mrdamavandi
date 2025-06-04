// app/api/categories/count/route.ts
import { prisma } from "@/lib/db";
import { CategorySchema } from "@/types/zod";
import { NextResponse } from "next/server";

type CategoryWithChildren = Omit<CategorySchema, 'id'> & { id: string; children: CategoryWithChildren[] };
function buildHierarchy(categories: CategorySchema[], parentId: string | null = null): CategoryWithChildren[] {
  return categories
    .filter(category => category.parentId === parentId && category.id)
    .map(category => ({
      ...category,
      id: category.id!, // Assert that id exists since we filtered for it
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
    interface CategoryDb {
      id: string;
      name: string;
      parentId: string | null;
      path: string[];
      _count: {
        products: number;
      };
    }

    interface CategoryWithTotals extends CategoryDb {
      totalProducts: number;
    }

    // Add 'slug' property to each category (assuming you can derive it from name or another field)
    type CategoryDbWithOptionalSlug = CategoryDb & { slug?: string };

    const categoriesWithTotals: (CategoryWithTotals & { slug: string; parentId: string | undefined })[] = allCategories.map((category: CategoryDbWithOptionalSlug): CategoryWithTotals & { slug: string; parentId: string | undefined } => {
      const descendants: CategoryDb[] = allCategories.filter((c: CategoryDb) => 
        c.path.includes(category.id) && c.id !== category.id
      );
      
      const totalProducts: number = descendants.reduce(
        (sum: number, descendant: CategoryDb) => sum + descendant._count.products,
        category._count.products
      );

      // If you have a slug field in your DB, use it here. Otherwise, generate from name.
      const slug = category.slug ?? category.name.toLowerCase().replace(/\s+/g, '-');

      return {
        ...category,
        parentId: category.parentId === null ? "" : category.parentId,
        totalProducts,
        slug
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