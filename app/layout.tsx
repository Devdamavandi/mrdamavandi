'use client'

import '@/app/globals.css'
import { Navbar } from "@/components/navbar"
import {  Providers } from "@/providers/provider"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import { usePathname } from "next/navigation"



const NoNavRoutes = [
	"/dashboard",
	"/register",
	"/login"
]

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {

	const pathname = usePathname()

	return (
		<html lang="en">
			<body>
				{!NoNavRoutes.some(route => pathname.startsWith(route)) && <Navbar />}
				<Providers>
					<main className="flex-grow container mx-auto px-4 py-8">
						{children}
					</main>
				</Providers>
				<ToastContainer position="bottom-right"/>
			</body>
		</html>
	)
}