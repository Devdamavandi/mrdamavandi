


'use client'

import { useCategories } from "@/hooks/useCategories";
import { poppins } from "@/lib/fonts";
import { CategorySchema, SettingSchema } from "@/types/zod";
import Link from "next/link";
import { useEffect, useState } from "react";


const FooterComponent = () => {

    const [categories, setCategories] = useState<CategorySchema[]>([]);
    const [categoriesCount, setCategoriesCount] = useState(0)

    const { data: Categories } = useCategories()

    // Categories Count
    useEffect(() => {
        const loadCategoriesCount = async () => {
            const res = await fetch('/api/settings?type=homepage')
            const data: SettingSchema[] = await res.json()
            const count = data.find(s => s.key === 'footerCategoriesCount')?.value
            setCategoriesCount(Number(count) || 0)
        }
        loadCategoriesCount()
    }, [])
    
    useEffect(() => {
        const fetchCategories = async () => {
            setCategories(Categories ?? [])
        }
        fetchCategories()
    }, [Categories])

    useEffect(() => {
        console.log("Categories count in footer: ", categoriesCount)
    }, [categoriesCount])
    
    return ( 
    <footer>
        <div className={`w-screen h-fit grid grid-cols-3 px-4 py-2 border-t-2 border-t-gray-100 bg-white ${poppins.className} font-light`}>
            <div className="text-gray-500">
                <h1 className="font-bold">Categories</h1>
                <ul className="grid grid-cols-1">
                    {categories.slice(0, categoriesCount)?.map(category => (
                        <li key={category.id}>
                            <span>
                                <Link href={`${category.slug}`}>{category.name}</Link>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="grid grid-cols-1 text-gray-500">
                <h1 className="font-bold">Company</h1>
                <Link href={`/about-us`}>About Us</Link>
                <Link href={`/contact`}>Contact</Link>
                <Link href={`/faq`}>FAQ / Help</Link>
                <Link href={`/terms-conditions`}>Terms & Conditions</Link>
                <Link href={`/privacy-policy`}>Privacy Policy</Link>
            </div>
            <div className="grid grid-cols-1 text-gray-500">
                <h1 className="font-bold">Support</h1>
                <Link href={`/customer-support`}>Customer Support / Returns</Link>
                <Link href={`/shipping-info`}>Shipping Info</Link>
                <Link href={`/social-media`}>Social Media Links</Link>
                <Link href={`/newsletter`}>Newsletter signup</Link>
            </div>
        </div>
        <p className="text-center">All rights Reserved.</p>
    </footer>
     )
}
 
export default FooterComponent;