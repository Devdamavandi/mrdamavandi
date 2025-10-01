

'use server'

import {prisma} from "@/lib/db"

/** TOTAL PRODUCTS */
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
/** TOTAL CATEGORIES */
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
    const totalCategoriesNow = await totalcategories()

    // Calculate New Categories Added in the Last Month
    const newCategoriesAddedInLastMonth = totalCategoriesNow - catsOneMonthAgo

    const progressPercentage = catsOneMonthAgo === 0 
        ? newCategoriesAddedInLastMonth * 100   // if starting from 0, each category is 100% increase
        : (newCategoriesAddedInLastMonth / catsOneMonthAgo) * 100

    return {progressPercentage}
}







//----------------------------------------------------------------------------------------------------------------------------------------------------------------------
/** TOTAL REVENUE */

export const totalRevenue = async () => {

    const totalIncome = await prisma.product.findMany({
        select: {
            revenue: true
        }
    })

    const all = totalIncome.reduce((sum, item) => sum + item.revenue, 0)
    return all
}

export const totalRevenuePercentage = async () => {
    const today = new Date()
    const oneMonthAgo = new Date(today.setMonth(today.getMonth() - 1))

    // Get orders from one month ago (before that date)
    const ordersOneMonthAgo = await prisma.order.findMany({
        where: {
            createdAt: { lt: oneMonthAgo },
            paymentStatus: 'PAID'
        },
        select: { total: true }
    })

    // Get orders from last month (between one month ago and now)
    const ordersLastMonth = await prisma.order.findMany({
        where: {
            createdAt: { 
                gte: oneMonthAgo,
                lt: new Date() 
            },
            paymentStatus: 'PAID'
        },
        select: { total: true }
    })

    const revenueOneMonthAgo = ordersOneMonthAgo.reduce((sum, order) => sum + order.total, 0)
    const revenueLastMonth = ordersLastMonth.reduce((sum, order) => sum + order.total, 0)

    // Calculate percentage increase
    const totalRevenuePercentageOverMonthAgo = revenueOneMonthAgo === 0
        ? (revenueLastMonth > 0 ? 100 : 0) // If starting from 0, show 100% if there's revenue
        : ((revenueLastMonth - revenueOneMonthAgo) / revenueOneMonthAgo) * 100

    return {totalRevenuePercentageOverMonthAgo}
}







/** ============================================================================================= */
