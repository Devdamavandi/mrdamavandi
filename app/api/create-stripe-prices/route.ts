
/**
 * THIS FILE IS CREATED TO TAKE THE PRODUCT NAME AND ITS VARIANTS
 * AND CREATE A STRIPE ID FROM THEM TO HELP SECURE THE PRODUCTS PRICE
 * AND DONT LET THE CUSTOMER TO TAMPER THE PRICES
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { withCors, handleOptions } from "@/lib/cors";

export function OPTIONS() {
  return handleOptions();
}


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)


export async function POST(req: NextRequest) {
    const body = await req.json()

    const { productName, variants } = body

    try {
        // 1. Create Stripe Product
        const stripeProduct = await stripe.products.create({
            name: productName,
        })

        // 2. Create  a price for each variant
        const stripePrices = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variants.map(async (variant: any) => {
                const price = await stripe.prices.create({
                    product: stripeProduct.id,
                    unit_amount: Math.round(variant.price * 100), // price in cents
                    currency: 'usd',
                    nickname: `${variant.name}`, // Shows in stripe dashboard
                    metadata: {
                        id: variant.id,
                        variantName: variant.name,
                        sku: variant.sku ?? "", // optional
                        color: variant.color ?? "",
                        size: variant.size ?? "",
                        price: variant.price ?? 0,
                        discount: variant.discount ?? 0,
                        stock: variant.stock ?? 0,
                        isDefault: variant.isDefault
                    }
                })

                return {
                    id: variant.id ?? price.metadata?.id ?? null,
                    ...variant,
                    attributes: variant.attributes ?? {
                        color: variant.color ?? '',
                        size: variant.size ?? ''
                    },
                    stripePriceId: price.id
                }
            })
        )

        return withCors(NextResponse.json({
            stripeProductId: stripeProduct.id,
            variantsWithStripeIds: stripePrices
        }))
    } catch (error) {
        console.error('Stripe error: ', error)
        return new NextResponse('Stripe error: ', { status: 500 })
    }
}