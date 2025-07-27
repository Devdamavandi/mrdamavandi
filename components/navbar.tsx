import Link from "next/link"
import BasketPopover from "./basketPopover"

export const Navbar = () => {


  
  return (
    <div className="sticky top-0 z-50 bg-white shadow py-2">
      <div className="flex items-center justify-between px-5">

        {/* Logo */}
        <div className="p-4 md:p-0">
          <Link href="/" className="hover:text-blue-600 text-nowrap ">
            My Ecommerce
          </Link>
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

        {/* Dashboard */}
        <div>
          <Link href="/dashboard" className="hover:text-purple-600">Dashboard</Link>
        </div>

      </div>
    </div>
  )
}
