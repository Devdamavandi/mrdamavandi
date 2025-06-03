


'use client'
import Nav from "@/components/ui/nav";
import TopNavigationNav from "@/components/dashboard/top-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { totalcategories, totalCategoriesIncreasePercent, totalProductIncreasePercent, totalProducts } from "@/lib/dashboard-queries";
import { useRouter } from "next/navigation";

const DashboardPage = () => {


    // for saving products data
    const [productCount, setProductCount] = useState<number | null>(null)
    const [progressPercentage, setProgressPercentage] = useState<number | null>(null)

    // for saving categories data
    const [categoriesCount, setCategoriesCount] = useState<number | null>(null)
    const [catsProgressPercentage, setCatsProgressPercentage] = useState<number | null>(null)


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
                
            } catch (error) {
                console.error('Failed to fetch product count: ', error)
            }
        }
        
        fetchData()
    },[])

    

    return ( 
            <div className="flex flex-col min-h-screen w-full">
                {/* Top Navigation */}
                <TopNavigationNav />
                {/* Main Content Area */}
                <div className="flex flex-1">
            
                    {/* Side Nav */}
                    <div className="hidden border-r bg-muted/40 md:block w-52">
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
                                            title: "Customers",
                                            icon: "customers",
                                            variant: "default",
                                            href: "/dashboard/customers"
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
                    <main className="flex-1 p-4 md:p-6">
                        {/* Stats Cards Row */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                            {/* Total Revenue Card */}
                            <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                        <span className="text-green-500">+20.1%</span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">$45.231.89</div>
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
                                                progressPercentage !== null ? `${progressPercentage > 0 ? '+' : '-'}${progressPercentage.toFixed(1)}%` : `Loading...`
                                            }</span>
                                            <span className="text-xs text-gray-500">from last month</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {productCount !== null ? productCount : 'Loading...'}
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
                                                {catsProgressPercentage !== null ? `${catsProgressPercentage > 0 ? '+' : '-'}${catsProgressPercentage.toFixed(1)}%` : `Loading...`}
                                            </span>
                                            <span className="text-xs text-gray-500">from last month</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {categoriesCount !== null ? categoriesCount : 'Loading...'}
                                        </div>
                                        <p className="text-xs text-gray-500">active categories</p>
                                    </CardContent>
                            </Card>
                            {/* Active Now Card */}
                            <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                                        <span className="text-green-500"></span>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">573</div>
                                        <p className="text-xs text-gray-500">Visitors today</p>
                                    </CardContent>
                            </Card>
                            {/* Recent Activity Section */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>Recent Orders</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Order table would go here */}
                                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                                            Orders chart placeholder
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Top Products</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Product list would go here */}
                                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                                            Products chart placeholder
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
     )
}
 
export default DashboardPage;