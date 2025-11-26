import Link from "next/link"
import BasketPopover from "./basketPopover"
import { MenuIcon, House, Shirt, FileUser, Headset, PersonStanding, UserPlus, LayoutDashboard } from 'lucide-react'
import { FiUser } from "react-icons/fi";
import { useDeviceType } from "@/hooks/useDeviceType" 
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"
import { PiSignOutBold } from "react-icons/pi";
import { IoIosLogIn } from "react-icons/io";
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

export const Navbar = () => {

  // I previously created a hook function in a seperate file to get the Device Screen Type & assign it here
  const deviceType = useDeviceType()
  const session = useSession()
  
  console.log('Session: ', session?.data?.user)
  
  return (
    <div className="sticky top-0 z-50 bg-white">
      <div className={`flex py-2 items-center justify-between px-5 shadow-md ${(deviceType === 'mobile' || deviceType === 'min-tablet') && 'flex-6'}`}>

        {/* Logo */}
        <div className={`${(deviceType === 'mobile' || deviceType === 'min-tablet') ? 'flex-4 py-3' : ''}`}>
          <Link href="/" className="hover:text-blue-600 text-nowrap bg-red-300 hidden md:block">
            My Ecommerce
          </Link>
          <Popover>
          <PopoverTrigger asChild className="md:hidden block">
            <MenuIcon/>
          </PopoverTrigger>
          <PopoverContent className="bg-white shadow w-screen h-screen rounded-none border-none mt-2">
            <div className="flex flex-col">
              <Link href="/" className="p-4 hover:text-purple-600 flex gap-2"><House/>Home</Link>
              <Link href="/products" className="hover:text-purple-600 p-4 flex gap-2"><Shirt/>Products</Link>
              <Link href={`/portfolio`} className="hover:text-purple-600 p-4 flex gap-2"><FileUser/>Portfolio</Link>
              <Link href={`/contact`} className="hover:text-purple-600 p-4 flex gap-2"><Headset/>Contact</Link>
              <Link href={`/aboutus`} className="hover:text-purple-600 p-4 flex gap-2"><PersonStanding/>About Us</Link>
            </div>
          </PopoverContent>
        </Popover>
        </div>

        {/* middle menu for big screen */}
        <div className="hidden md:flex justify-between">
          <Link href="/" className="p-4 hover:text-purple-600">Home</Link>
          <Link href="/products" className="hover:text-purple-600 p-4">
            Products
          </Link>
          <Link href="/checkout" className="hover:text-purple-600 p-4">
            Checkout
          </Link>
          <Link href={`/portfolio`} className="hover:text-purple-600 p-4">
            Portfolio
          </Link>

          <BasketPopover/>
        </div>

        {/* Basket Icon */}
        <div className={`block md:hidden ${(deviceType === 'mobile' || deviceType === 'min-tablet') ? 'flex-1' : ''}`}><BasketPopover/></div>


        {/* Dashboard */}
        <div className={`${(deviceType === 'mobile' || deviceType === 'min-tablet') ? 'flex-0.5' : ''}`}>
          <button 
            className={`hover:text-purple-600 text-gray-700 align-middle`}
            // onClick={}
            >
              {session?.data?.user?.id ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="cursor-pointer">
                    <Image
                      src={session.data.user.image || '/noimage-user.png'}
                      width={35}
                      height={35}
                      className="rounded-full object-cover"
                      alt={session?.data?.user?.name || ''}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-44 border-none rounded-none sm:w-54 bg-white shadow-md" align="start" sideOffset={10}>
                    <DropdownMenuItem className="flex flex-col items-start space-y-4">
                      {session?.data?.user?.role !== 'ADMIN' &&
                        <>
                          <Link href={'/dashboard'} className="flex gap-2 cursor-pointer"><LayoutDashboard/>Dashboard</Link>
                        </>
                      }
                      <button onClick={async () => await signOut({ redirect: false })} className="flex gap-2 items-center cursor-pointer"><PiSignOutBold size={20} />Sign out</button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <FiUser className="size-8"/>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-44 border-none rounded-none sm:w-54 bg-white shadow-md" align="start" sideOffset={10}>
                    <DropdownMenuItem className="flex flex-col items-start space-y-4">
                      <Link href={'/auth/login'} className="flex gap-2 items-center"><IoIosLogIn size={20}/>Login</Link>
                      <Link href={'/auth/register'} className="flex gap-2 items-center"><UserPlus size={20}/>Signup</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
          </button>
        </div>

      </div>
    </div>
  )
}
