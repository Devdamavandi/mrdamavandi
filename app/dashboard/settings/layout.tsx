import TopNavigationNav from "@/components/dashboard/top-nav";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import React from "react";




export default function layout({children}: Readonly<{children: React.ReactNode}>) {

    return (
        <div>
            <TopNavigationNav/>
            <div className="flex">
                <div className="hidden border-r border-r-gray-200 md:block w-52">
                    <ScrollArea className="h-[calc(100vh-8rem)] px-3">
                            <div className="space-y-1 mt-5">
                                <ul>
                                    <li>
                                        <Link href={`/dashboard/settings/homepage`}>homepage</Link>
                                    </li>
                                </ul>
                            </div>
                    </ScrollArea>
                </div>
                {children}
            </div>
        </div>
    )
}