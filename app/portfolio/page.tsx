
'use client'
import { Bebas_Neue } from 'next/font/google'
import { Poppins } from 'next/font/google'
import { Roboto } from 'next/font/google'
 
const bebas = Bebas_Neue({
subsets: ['latin'],
weight: '400',

})

const poppins = Poppins({
    subsets: ['latin'],
    weight: '300'
})

const roboto = Roboto({
    subsets: ['latin'],
    weight: '300'
})

const PortfolioPage = () => {

    return ( 
        <div className="flex flex-col items-center mt-20 space-y-6 ">
            <h1 className={`text-7xl text-center font-semibold ${bebas.className} tracking-wide `}>Get Your Own Online Store in 5 Days</h1>
            <h3 className={`pt-4 text-3xl text-center leading-8 tracking-tight ${roboto.className}`}>I build fast, clean, mobile-ready e-commerce stores with<br/> admin dashboard, product management, and order system.</h3>

            <h2 className={` text-4xl pt-8 ${bebas.className} `}>Benefits</h2>
            <div className=''>
                <ul className={`pt-2 space-y-4 ${poppins.className}`}>
                    <li>✅ Home page with Product showcase</li>
                    <li>✅ Search & Category filtering</li>
                    <li>✅ Product Details page (with variant selection, description, wishlist button)</li>
                    <li>✅ Shopping Cart Management</li>
                    <li>✅ Admin panel to Manage Products, Orders</li>
                    <li>✅ Cash on Delivery or Stripe Checkout</li>
                    <li>✅ Address Management (save billing/shipping)</li>
                    <li>✅ Inventory Logic (show out-of-stock, quantity updates)</li>
                    <li>✅ Mobile Responsive Design</li>
                    <li>✅ Optional Customizations (Additional Cost included maybe)</li>
                    <li>✅ No Coding Or Design Required!</li>
                </ul>
            </div>

            <h2 className={`text-4xl pt-8 ${bebas.className} `}>My Technical Stack:</h2>
                <ul className={`space-y-2 tracking-tight ${poppins.className} `}>
                    <li>🛠️ Next.js App Router</li>
                    <li>🛠️ Prisma + MongoDB</li>
                    <li>🛠️ Stripe for card payments</li>
                    <li>🛠️ Zustand, React Query, Tailwind (By All Details Specifically For Ecommerce)</li>
                    <li>🛠️ Authentication (with sessions)</li>
                </ul>

            <h2 className={`text-center text-4xl pt-6 ${bebas.className} `}>Delivery Model</h2>
            <div>
                <ul className={`pt-2 space-y-2 tracking-tight ${poppins.className} `}>
                    <li>🧱 Current Design Used</li>
                    <li>🎥 Full Tutorial for How To Manage Store</li>
                    <li>💾 Give You The Full Code of Your Project</li>
                    <li>🔃 Hosted On Vercel With Your Domain</li>
                    <li className={`tracking-normal ${poppins.style.fontWeight}`}>👉 {`" You order my store. I set it up & host it. I send you login access + tutorial "`}</li>
                </ul>
            </div>

            <h2 className={`text-left text-4xl pt-6 ${bebas.className} `}>Contact Me</h2>
            <div className='flex flex-col space-y-2 items-center'>
                <a
                    href="https://wa.me/+939884521247"
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-green-500 text-white px-4 py-2 rounded'
                >
                    Chat on Whatsapp
                </a>
                <span className={`${poppins.className}`}><strong className='font-semibold'>Email</strong>: {`developer@davidknightofficial.com`}</span>
            </div>
        </div>
     );
}
 
export default PortfolioPage;