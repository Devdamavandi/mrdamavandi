
'use client'

import Link from "next/link";
import { Button } from "../ui/button";
import { Icons } from "../ui/icons";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

const TopNavigationNav =  () => {
    const router = useRouter()
    const {data: session} = useSession()
    return ( 
        <header className="hidden md:flex sticky top-0 z-10 h-16 items-center justify-between border-b 
        bg-gradient-to-r from-blue-700 to-purple-500 text-white rounded-sm px-4 md:px-6">
            {/* Left-aligned items (icon + dashboard + analytics) */}
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 text-lg font-semibold md:text-base">
                    <Icons.package className="h-6 w-6 cursor-pointer hover:text-gray-600"  onClick={() => router.push('/')}/>
                    <button className="sr-only">Mrdamavandi Ecommerce Store</button>
                </span>
                <Button variant={'ghost'} className="h-8 w-fit hover:text-gray-600">
                    <Link href={'/dashboard'}>Dashboard</Link>
                </Button>
                <Button variant={'ghost'} className="h-8 w-fit">
                    Analytics
                </Button>
            </div>

            {/* Right-aligned sign-out button */}
            <div className="flex items-center text-lg">
                <div className="flex gap-0 m-0 items-center">
                    <Image 
                        src={session?.user?.image || "/default-image.png"}
                        alt={session?.user?.name || "image name"}
                        width={40}
                        height={30}
                        className="rounded-full m-0 p-0"
                    />
                    <Button onClick={() => router.push('/dashboard/profile')}
                            className="cursor-pointer hover:text-gray-600"
                        >
                        Profile
                    </Button>
                </div>
                <Button 
                    variant={'default'} 
                    className="cursor-pointer hover:text-gray-600"
                    onClick={async () => {
                        await signOut({redirect: false})
                        router.push('/auth/login')
                    }}
                >
                    Sign Out
                </Button>
            </div>
        </header>
    );
}
 
export default TopNavigationNav;