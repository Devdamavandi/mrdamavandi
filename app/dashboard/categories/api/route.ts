





import {prisma} from "@/lib/db";
import { NextResponse } from "next/server";
import path from "path";



export async function GET() {

    const categories = await prisma.category.findMany({
        include: {
            parent: { select: { id: true, name: true }},
            children: true,
            _count: { select: { products: true } }
        },// Count products if needed
        orderBy: { depth: 'asc' }
    })

    return NextResponse.json(categories)
}



export async function POST(req: Request) {

    const {name, parentId, image} = await req.json()
    const slug = name.toLowerCase().replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, '-')

    try {
        let path: string[] = []
        let depth = 0

        if (parentId) {
            const parent = await prisma.category.findUnique({
                where: {id: parentId},
                select: {path: true, depth: true}
            })
            if (parent) {
                path = [...parent.path, parentId]
                depth = parent.depth + 1
            }
        }


        const category = await prisma.category.create({
            data: {
             name,
              slug,
              image,
              parentId: parentId || null,
              path,
              depth
             }
            })
        return NextResponse.json(category, {status: 201})
    } catch {
        return NextResponse.json(
            {error: "Category already exists!!"},
            {status: 400}
        )
    }
}


export async function PUT(req: Request) {
    const {id, name,image,  parentId} = await req.json()
    const slug = name.toLowerCase().replace(/\s+/g, '-')

    try {
        const current = await prisma.category.findUnique({
            where: {id},
            select: {parentId: true}
        })

        let path: string[] = []
        let depth = 0

        // Only update path/depth if parentId changed
        if (parentId !== current?.parentId) {
            if (parentId) {
                const parent = await prisma.category.findUnique({
                    where: { id: parentId },
                    select: {path: true, depth: true}
                })
                if (parent) {
                    path = [...parent.path, parentId]
                    depth = parent.depth + 1
                }
            }
        }

        const category = await prisma.category.update({
            where: {id},
            data: {
                name,
                slug,
                parentId: parentId || null,
                ...(path.length > 0 && {path}),  // only update if path changed 
                ...(depth > 0 && {depth}),  // only update if depth changed
                ...(image && {image})
            }
        })
        return NextResponse.json(category)
    } catch {
        return NextResponse.json(
            {error: 'Error in category Update'}, {status: 400}
        )
    }

}



