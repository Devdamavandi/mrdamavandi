import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";






export async function GET() {

    try {
        const variants = await prisma.variant.findMany()

        if (!variants) return null

        return NextResponse.json(variants, {status: 400})
    } catch (error) {
        console.error('Fetching Variants failed', error)
        return NextResponse.json({
            error: 'Error in fetch the variants in server'
        } , {status: 500})
    }
}