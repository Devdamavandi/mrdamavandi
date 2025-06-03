




import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';



export async function GET(req: Request, {params} : {params: {id: string}}) {
    
    try {
        const {id} = params
        const variant = await prisma.variant.findUnique({
            where: {
                id: id
            }
        })

        if (!variant) {
            return NextResponse.json({ error: 'Variant not found!' }, {status: 404})
        }

        return NextResponse.json(variant)
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        }
    }
} 