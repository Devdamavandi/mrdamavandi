
'use client'

import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useSession } from "next-auth/react"
import { signOut } from "@/auth"
import { PiSignOutBold } from "react-icons/pi"
import { MdOutlineEmail } from "react-icons/md";
import { roboto } from "@/lib/fonts"
import { useState } from "react"
import ProfilePage from "@/app/dashboard/profile/page"
import CustomerOrdersPage from "./CustomerOrders"



const CustomerDashboardPage = () => {
    const session = useSession()

    const [activeTab, setActiveTab] = useState("profile")

    return (
        <div className="flex flex-col min-h-screen">
            <header className="top-0 z-10 sticky h-16 border-b border-b-gray-200 flex items-center justify-between px-6">
                {/* Left aligned items */}
                <div className="flex gap-6 text-gray-700">
                    <span>{session?.data?.user?.name}</span>
                    <span className="flex items-center gap-1"><MdOutlineEmail/>{session?.data?.user?.email}</span>
                </div>

                {/* Right aligned items */}
                <div>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild className="cursor-pointer">
                        <Image
                        src={session?.data?.user?.image || '/noimage-user.png'}
                        width={35}
                        height={35}
                        className="rounded-full object-cover"
                        alt={session?.data?.user?.name || ''}
                        />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-44 border-none rounded-none sm:w-54 bg-white shadow-md mr-6" align="start" sideOffset={10}>
                        <DropdownMenuItem asChild className="hover:bg-slate-300 rounded-lg">
                            <button
                                onClick={async () => await signOut({ redirect: false })}
                                className="flex gap-2 items-center cursor-pointer pl-1 pr-10 py-2">
                                    <PiSignOutBold size={20} />Sign Out
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="grow-[0.99] mx-6 my-4 rounded-4xl bg-slate-100 h-[400px] flex">
                {/* Left Navigation */}
                <div className="w-65 mx-5 my-6">
                    <div className="flex flex-col items-center justify-center my-4 gap-4">
                        <button 
                        className={`text-2xl font-light ${roboto.className} hover:bg-slate-300 px-20 py-2 rounded-xl cursor-pointer`} onClick={() => setActiveTab("profile")}>
                            Profile</button>
                        <button className={`text-2xl font-light ${roboto.className} hover:bg-slate-300 px-20 py-2 rounded-xl cursor-pointer`} onClick={() => setActiveTab("orders")}>
                            Orders
                            </button>
                        <button className={`text-2xl font-light ${roboto.className} hover:bg-slate-300 px-20 py-2 rounded-xl cursor-pointer`}>Wishlist</button>
                        <button className={`text-2xl font-light ${roboto.className} hover:bg-slate-300 px-20 py-2 rounded-xl cursor-pointer`}>Reviews</button>
                        <button className={`text-2xl font-light ${roboto.className} hover:bg-slate-300 px-20 py-2 rounded-xl cursor-pointer`}>Addresses</button>
                        <button className={`text-2xl font-light ${roboto.className} hover:bg-slate-300 px-20 py-2 rounded-xl cursor-pointer`}>Transactions</button>
                        <button className={`text-2xl font-light ${roboto.className} hover:bg-slate-300 px-20 py-2 rounded-xl cursor-pointer`}>Settings</button>
                        <button className={`text-2xl font-light ${roboto.className} hover:bg-slate-300 px-20 py-2 rounded-xl cursor-pointer`}>Signout</button>
                    </div>
                </div>
                
                {/* Seperator */}
                <div className="relative flex items-center justify-center h-full">
                    <div 
                        className={`absolute top-0 bottom-0 left-1/12 -translate-x-50 bg-slate-300 mx-50 my-4`} 
                        style={{ width: '0.5px' }}/>
                </div>

                {/* Right Content */}
                <div>
                    {activeTab === "profile" && <ProfilePage/>}
                    {activeTab === "orders" && session?.data?.user?.id && <CustomerOrdersPage userId={session?.data?.user?.id}/>}
                </div>
            </main>
        </div>
    )
}



export default CustomerDashboardPage