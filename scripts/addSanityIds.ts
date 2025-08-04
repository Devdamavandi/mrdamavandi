
/** This is A Script File
 * For Creating Sanity IDs for Products
 * Run with 'npx tsx scripts/addSanityIds.ts'
 * Because Some Products have been existing previously
 * without Sanity IDs
 * This script will add a unique Sanity ID to each product
 */

import { prisma } from "@/lib/db";

async function main() {
    const products = await prisma.product.findMany()

    for (let i = 0; i < products.length; i++) {
        await prisma.product.update({
            where: { id: products[i].id },
            data: { sanityId: `31833d97-d4a6-47e7-85d6-8f4be05b${i+1}7e3` }
        })
    }
    console.log('Sanity IDs added!')
}

main().finally(() => prisma.$disconnect())