import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"




export async function GET() {
    try {
        const deal = await prisma.dealOfTheDay.findFirst({
            include: {
                dailyDealProduct: true,
            }
        })
        return NextResponse.json(deal, {status: 200})
    } catch (error) {
        console.error('failed to get deal', error)
        return NextResponse.json({
            error: 'couldn fetch the deal'
        } , {status: 500})
    }
}


export async function POST(req: Request) {

    try {
        const body = await req.json()
        const {id, dealName, dealEndTime, dailyDealProduct, discountRate, isActive} = body

        if (
            !dealName ||
            !dealEndTime ||
            !dailyDealProduct ||
            discountRate === undefined
        ) {
            return NextResponse.json({ error: 'Required fields missing: dealName, dealEndTime, dailyDealProduct.id, discountRate'}, {status: 400})
        }

        console.log('Creating deal with data:', {
            dealName,
            dealEndTime: new Date(dealEndTime),
            dailyDealProductId: dailyDealProduct.id,
            discountRate,
            isActive
        })

        const deal = await prisma.dealOfTheDay.create({
            data: {
                ...(id && {id: id}),
                dealName: dealName,
                dealEndTime: new Date(dealEndTime),
                dailyDealProduct: {
                    connect: { id: dailyDealProduct.id }
                },
                discountRate: Number(discountRate),
                isActive: Boolean(isActive)
            }
        })
      

        return NextResponse.json(deal, {status: 201})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Deal Creation error: ', error)
        return NextResponse.json({
            error: 'Error in Creating A Deal!!',
            details: error.message,
        }, {status: 500})
    }
}