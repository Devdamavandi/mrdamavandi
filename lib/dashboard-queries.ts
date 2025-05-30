

'use server'

import {prisma} from "@/lib/db"


export const totalProducts  = async () => {

    const total = await prisma.product.count()
    return total
}


export const totalProductIncreasePercent = async () => {

    const today = new Date()
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1))
    const oneMonthAgoDate = oneMonthAgo.toLocaleDateString() 
    // Count products created within the last 30 days
    const productsOneMonthAgo = await prisma.product.count({
        where: {
            createdAt: {
                lt: oneMonthAgo // Products created on or after 30 days ago
            }
        }
    })
    // Get Current Total
    const totalProductsNow = await prisma.product.count()

    // Calculate new products added in last month
    const newProductsAddedInLastMonth = totalProductsNow - productsOneMonthAgo

    // Calculate percentage increase
    const progressPercentage = productsOneMonthAgo === 0 
    ? newProductsAddedInLastMonth * 100   // If starting from 0, each product is 100% increase
    : (newProductsAddedInLastMonth / productsOneMonthAgo) * 100

    return {productsOneMonthAgo,
        totalProductsNow,
        newProductsAddedInLastMonth,
        progressPercentage,
        oneMonthAgoDate
    }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const totalcategories = async () => {

    const totalCats = await prisma.category.count()
    return totalCats
}


export const totalCategoriesIncreasePercent = async () => {

    const today = new Date()
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1))

    const catsOneMonthAgo  = await prisma.category.count({
        where: {
            createdAt: {
                lt: oneMonthAgo
            }
        }
    })

    // Total Categories Now
    const totalCategoriesNow = await prisma.category.count()

    // Calculate New Categories Added in the Last Month
    const newCategoriesAddedInLastMonth = totalCategoriesNow - catsOneMonthAgo

    const progressPercentage = catsOneMonthAgo === 0 
        ? newCategoriesAddedInLastMonth * 100   // if starting from 0, each category is 100% increase
        : (newCategoriesAddedInLastMonth / catsOneMonthAgo) * 100

    return {progressPercentage}
}


//----------------------------------------------------------------------------------------------------------------------------------------------------------------------
