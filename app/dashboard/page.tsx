


'use client'
import Nav from "@/components/ui/nav";
import TopNavigationNav from "@/components/dashboard/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { totalcategories, totalCategoriesIncreasePercent, totalProductIncreasePercent, totalProducts, totalRevenue, totalRevenuePercentage } from "@/lib/dashboard-queries";
import { OrderSchema, ProductFormValues } from "@/types/zod";
import TrimText from "@/lib/trimText";
import { Poppins } from "next/font/google";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCount } from "@/lib/utils";

const poppins = Poppins({
    subsets: ['latin'],
    weight: '300'
})
const DashboardPage = () => {


    // for saving products data
    const [productCount, setProductCount] = useState<number | null>(null)
    const [progressPercentage, setProgressPercentage] = useState<number | null>(null)

    // for saving categories data
    const [categoriesCount, setCategoriesCount] = useState<number | null>(null)
    const [catsProgressPercentage, setCatsProgressPercentage] = useState<number | null>(null)

    // Fetching Total Revenue from dashboard-queries
    const [totalRevenueValue, setTotalRevenueValue] = useState<number | null>(null)
    const [totalRevenuePercentageValue, setTotalRevenuePercenatgeValue] = useState<number | null>(null)

    // Active users 
    const [activeUsers, setActiveUsers] = useState(0)

    // Active Users Today
    const [activeUsersToday, setActiveUsersToday] = useState(0)

    // limit & Orders Variables
    const [limit, setLimit] = useState<string>('5')
    const [orders, setOrders] = useState<OrderSchema[]>([])

    // Storing Criteria Value Selected For Top Products Section
    const [criteriaValue, setCriteriaValue] = useState('most-viewed')
    const [topProducts, setTopProducts] = useState<ProductFormValues[]>([])

    // fetch data for cards at page load or reload
    useEffect(() => {
        const fetchData = async () => {

            try {
                const count = await totalProducts()
                setProductCount(count)

                const totals = await totalProductIncreasePercent()
                setProgressPercentage(totals.progressPercentage)

                const totalCats = await totalcategories()
                setCategoriesCount(totalCats)

                const catsProgress = await totalCategoriesIncreasePercent()
                setCatsProgressPercentage(catsProgress.progressPercentage)

                const revenueProg = await totalRevenuePercentage()
                setTotalRevenuePercenatgeValue(revenueProg.totalRevenuePercentageOverMonthAgo)
                
            } catch (error) {
                console.error('Failed to fetch product count: ', error)
            }
        }
        
        fetchData()
    },[])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const revenue = await totalRevenue()
                setTotalRevenueValue(revenue)
            } catch (error) {
                console.error('Failed to fetch Total Revenue Data', error)
            }
        }
        fetchData()
    }, [])

    // Get Online Users count
    useEffect(() => {
        const onlineUsers = async () => {
            const res = await fetch('/api/active-user')
            const users = await res.json()
            setActiveUsers(users.count)
        }
        onlineUsers()
    }, [])

    // Get All active users from tonight 00:00 Am until now
    useEffect(() => {
        const fetchTodayUsers = async () => {
            const res = await fetch('/api/active-user?today=true')
            const data = await res.json()
            setActiveUsersToday(data.count)
        }
        fetchTodayUsers()
    }, [])

    //  Get Limited Orders from the Orders action file - Recent Orders
    useEffect(() => {
        const getOrders = async () => {
            const ress = await fetch(`/api/orders?limit=${Number(limit)}`)
            const ordersGot = await ress.json()
            setOrders(ordersGot.recents)
        }
        getOrders()
    }, [limit])

    // Fetching Top Products from server
    useEffect(() => {
        const handleCriteria = async () => {
            const res = await fetch(`/api/products/top?criteria=${criteriaValue}`)
            const data = await res.json()
            if (data.error) {
                setTopProducts([])
                console.error('Error in fetching top products from server(client-side)')
            } else {
                setTopProducts(data.topProducts || [])
            }
        }
        handleCriteria()
    }, [criteriaValue])

    console.log(topProducts)
    
    return ( 
            <div className="flex flex-col">
                {/* Top Navigation */}
                <TopNavigationNav />
                {/* Main Content Area */}
                <div className="flex">
            
                    {/* Side Nav */}
                    <div className="hidden border-r border-gray-300 bg-muted/40 md:block w-52">
                        <div className="flex flex-col gap-2 h-full max-h-screen">
                            <div className="flex-1 overflow-auto py-2">
                                <Nav
                                    links={[
                                        {
                                            title: "Dashboard",
                                            icon: "dashbaord",
                                            variant: "default",
                                            href: "/dashboard"
                                        },
                                        {
                                            title: "Products",
                                            icon: "products",
                                            variant: "ghost",
                                            href: "/dashboard/products"
                                        },
                                        {
                                            title: "Categories",
                                            icon: "categories",
                                            variant: "default",
                                            href: "/dashboard/categories"
                                        },
                                        {
                                            title: "Orders",
                                            icon: "orders",
                                            variant: "ghost",
                                            href: "/dashboard/orders"
                                        },
                                        {
                                            title: "Customers",
                                            icon: "customers",
                                            variant: "default",
                                            href: "/dashboard/customers"
                                        },
                                        {
                                            title: "Reviews",
                                            icon: "reviews",
                                            variant: 'ghost',
                                            href: "/dashboard/reviews"
                                        },
                                        {
                                            title: "Settings",
                                            icon: "settings",
                                            variant: "default",
                                            href: "/dashboard/settings"
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Content Section */}
                    <main className="p-4 md:p-6 flex-1">
                        {/* Stats Cards Row */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                            {/* Total Revenue Card */}
                            <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                        <span className="text-green-500">+{totalRevenuePercentageValue}%</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">$ {totalRevenueValue !== null ? totalRevenueValue : <span className="text-sm text-gray-600 font-light">Loading...</span>}</div>
                                        <p className="text-xs text-gray-500">vs last month</p>
                                    </CardContent>
                            </Card>
                            {/* Products Card */}
                            <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Products</CardTitle>
                                        <div className="flex flex-col">
                                            <span className={`${
                                                progressPercentage === null || progressPercentage === 0
                                                ? 'text-black'
                                                : progressPercentage < 0
                                                    ? 'text-red-500'
                                                    : 'text-green-500'
                                            }`}>{
                                                progressPercentage !== null ? `${progressPercentage > 0 ? '+' : '-'}${progressPercentage.toFixed(1)}%` : <span className="text-sm text-gray-600 font-light">Loading...</span>
                                            }</span>
                                            <span className="text-xs text-gray-500">from last month</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {productCount !== null ? productCount : <span className="text-sm text-gray-600 font-light">Loading...</span>}
                                        </div>
                                        <p className="text-xs text-gray-500">in inventory</p>
                                    </CardContent>
                            </Card>
            
                            {/* Categories Card */}
                            <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                                        <div className="flex flex-col">
                                            <span className={`${
                                                catsProgressPercentage === null || catsProgressPercentage === 0
                                                    ? 'text-black'
                                                    : catsProgressPercentage < 0
                                                    ? 'text-red-500'
                                                    : 'text-green-500'
                                            }`}>
                                                {catsProgressPercentage !== null ? `${catsProgressPercentage > 0 ? '+' : '-'}${catsProgressPercentage.toFixed(1)}%` : <span className="text-sm text-gray-600 font-light">Loading...</span>}
                                            </span>
                                            <span className="text-xs text-gray-500">from last month</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {categoriesCount !== null ? categoriesCount : <span className="text-sm text-gray-600 font-light">Loading...</span>}
                                        </div>
                                        <p className="text-xs text-gray-500">active categories</p>
                                    </CardContent>
                            </Card>
                            {/* Online Users Card */}
                            <Card className="flex flex-col justify-between">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                                        <span className="text-green-500">{activeUsers}</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{activeUsersToday ? activeUsersToday : <span className="text-sm text-gray-600 font-light">Loading...</span>}</div>
                                        <p className="text-xs text-gray-500">Visitors today</p>
                                    </CardContent>
                            </Card>
                        </div>
                        {/* Recent Activity Section */}
                        <div className="flex gap-4 w-full">
                            {/* Recent Orders */}
                                <Card className="flex-2 border border-b">
                                    <CardHeader className="flex justify-between items-center">
                                        <CardTitle className="pt-2">Recent Orders</CardTitle>
                                        <Select value={limit} onValueChange={setLimit}>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="choose limit"/>
                                            </SelectTrigger>
                                            <SelectContent className="bg-white">
                                                <SelectGroup>
                                                    <SelectItem value="5">5</SelectItem>
                                                    <SelectItem value="10">10</SelectItem>
                                                    <SelectItem value="15">15</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </CardHeader>
                            <ScrollArea className="h-38 overflow-auto">
                                    <CardContent>
                                        {/* Order table would go here */}
                                        <div className=" flex flex-col text-gray-500">
                                            {orders && orders.map((order, index) => (
                                                <div key={order.id}>
                                                    <p className={`text-sm mb-2 ${poppins.className}`}>({index + 1}) {order.orderNumber} - <span className="mr-0.5">$</span>{order.total}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                            </ScrollArea>
                                </Card>
                            {/* Recent Top Products */}
                            <Card className="flex-2">
                                <CardHeader className="flex justify-between items-center">
                                    <CardTitle>Top Products</CardTitle>
                                    <Select value={criteriaValue} onValueChange={setCriteriaValue}>
                                        <SelectTrigger className="w-[180px] !mb-0">
                                            <SelectValue placeholder="choose criteria"/>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectGroup>
                                                <SelectLabel>Based on</SelectLabel>
                                                <SelectItem value="most-purchased">Most Purchased</SelectItem>
                                                <SelectItem value="most-viewed">Most Viewed</SelectItem>
                                                <SelectItem value="most-wishlisted">Most Wishlisted</SelectItem>
                                                <SelectItem value="highest-revenue">Highest Revenue-Generating</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </CardHeader>
                                <CardContent>
                                    {/* Product list would go here */}
                                    <div className="flex flex-col text-gray-500 space-y-2">
                                        {topProducts && topProducts.length > 0 ? (
                                             topProducts.map((tProduct) => (
                                            <div key={tProduct.id} className="text-sm flex justify-between pr-1">
                                                    <Link href={`/products/${tProduct.slug}`} className="hover:text-blue-500 ">{TrimText(tProduct.name, 65)}</Link>
                                                    { criteriaValue === 'most-wishlisted' 
                                                        ? (<span className="pl-4">{formatCount(tProduct?.WishlistItem?.length ?? 0)}</span>)
                                                        : criteriaValue === 'most-viewed' 
                                                        ? (<span className="pl-4">{formatCount(tProduct.views ?? 0)}</span>)
                                                        : criteriaValue === 'highest-revenue'
                                                        ? (<span className="pl-4">${tProduct.revenue?.toFixed(2)}</span>)
                                                        : criteriaValue === 'most-purchased'
                                                        ? (<span className="pl-4">{formatCount((tProduct)?.purchaseCount ?? 0)}</span>)
                                                        : null
                                                     }
                                            </div>
                                        ))
                                        ) : (
                                            <span className="text-sm text-gray-400">No products found.</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                    </main>
                </div>
            </div>
     )
}
 
export default DashboardPage;