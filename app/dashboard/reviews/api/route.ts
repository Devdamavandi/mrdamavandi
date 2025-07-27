import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";




export async function GET() {

    try {
        const reviews = await prisma.review.findMany({
            include: {
                user: true,
                product: true
            }
        })

        if (!reviews) return NextResponse.json({ error: 'No review has Found!' })
        
        return NextResponse.json(reviews)
    } catch (error) {
        console.error('Couldnt fetch reviews!', error)
        return NextResponse.json({ error: 'Error loading reviews!!' }, { status: 500 })
    }
}

export async function POST(req: Request) {

    try {
        const body = await req.json()
        const { selectedId, isChecked } = body

        if (!selectedId) throw new Error('No selected checkboxes received!')

        const checkedReview = await prisma.review.findUnique({
            where: { id: selectedId }
        })

        if (!checkedReview) throw new Error('Review doesnt exists!')

        return await prisma.review.update({
            where: { id: checkedReview.id },
            data: {
                isChecked: isChecked
            }
        })

    } catch (error) {
        console.error('Error Updating Review', error)
        return NextResponse.json({ error: 'Couldnt Update Review(server)' })
    }
}