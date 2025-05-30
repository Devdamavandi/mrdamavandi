

import { usePathname } from "next/navigation"
import { Icons } from "./icons"
import { cn } from "@/lib/utils"
import { ScrollArea } from "./scroll-area"
import { Button } from "./button"
import Link from "next/link"



interface NavItem {
    title: string
    href?: string
    disabled?: boolean
    external?: boolean 
    icon?: keyof typeof Icons
    label?: string
    variant?: "default" | "ghost"
    className?: string
}

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {
    links: NavItem[]
}

const Nav = ({ className, links, ...props}: NavProps) => {
    const pathname = usePathname()

    return ( 
        <div className={cn("pb-12", className)} {...props}>
            <div className="space-y-4 py-4">
                <ScrollArea className="h-[calc(100vh-8rem)] px-3">
                    <div className="space-y-1">
                        {links.map((item) => {
                            const Icon = item.icon && Icons[item.icon]
                            return (
                                item.href && (
                                    <Button
                                        key={item.href}
                                        variant={item.variant || "ghost"}
                                        className={cn("w-full justify-start", pathname === item.href && "bg-muted hover:bg-muted")}
                                        asChild
                                    >
                                        <Link href={item.href}>
                                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                                            {item.title}
                                            {item.label && (
                                                <span>
                                                  {item.label}  
                                                </span>
                                            )}
                                        </Link>
                                    </Button>
                                )
                            )
                        })}
                    </div>
                </ScrollArea>
            </div>
        </div>
     )
}
 
export default Nav;

