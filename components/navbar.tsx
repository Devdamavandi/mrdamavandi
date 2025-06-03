import Link from "next/link"
import BasketPopover from "./basketPopover"

export const Navbar = () => {


  
  return (
    <nav className="sticky top-0 z-50 bg-white shadow py-2">
      <div className="container flex items-center justify-between px-10 ">
        <Link href="/" className="hover:text-blue-600">
          My Ecommerce
        </Link>
        {/* middle menu for big screen */}
        <div className="hidden md:flex items-center mx-[30rem] flex-6 justify-between">
          <Link href="/" className="p-4 hover:text-purple-600">Home</Link>
          <Link href="/products" className="hover:text-purple-600 p-4">
            Products
          </Link>
          <Link href="/checkout" className="hover:text-purple-600 p-4">
            Checkout
          </Link>

          <BasketPopover/>

        </div>
        {/* Dashboard */}
        <div className="flex-1">
          <Link href="/dashboard" className="hover:text-purple-600">Dashboard</Link>
        </div>
        <div className="flex items-center space-x-4"></div>
      </div>
    </nav>
  )
}
