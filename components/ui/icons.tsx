

import {
    LayoutDashboard,
    ShoppingCart,
    Tags,
    Users,
    Settings,
    Package,
} from 'lucide-react'
import { FaRegComments } from "react-icons/fa";
import dynamic from 'next/dynamic';

const TbShoppingCartCheck = dynamic(() => import('react-icons/tb').then(mod => mod.TbShoppingCartCheck))

export const Icons = {
    dashbaord: LayoutDashboard,
    products: ShoppingCart,
    categories: Tags,
    customers: Users,
    settings: Settings,
    package: Package,
    orders: TbShoppingCartCheck,
    reviews: FaRegComments
}