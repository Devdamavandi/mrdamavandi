import { NextResponse } from "next/server";
import Stripe from "stripe";




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' })

export async function GET() {
    try {
        const acc = await stripe.accounts.retrieve()
        return NextResponse.json({ success: true, acc })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ success: false, message }, { status: 500 })
    }
}