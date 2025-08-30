'use client'

import '@/app/globals.css'
import { Navbar } from "@/components/navbar"
import {  Providers } from "@/providers/provider"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import { usePathname } from "next/navigation"
import { Inter } from 'next/font/google'
import FooterComponent from '@/components/ui/footer'
import { useEffect } from 'react'

const NoNavRoutes = [
	"/dashboard",
	"/register",
	"/login",
	"/portfolio"
]

const inter = Inter({
	subsets: ['latin'],
	weight: '400'
})

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {

	// send a heartBeat request to the activeUsers server to say that the user is still in the app
	useEffect(() => {
		let guestId = localStorage.getItem("guestId")
		if (!guestId) {
			guestId = crypto.randomUUID()
			localStorage.setItem("guestId", guestId)
		}
		const sendHeartbeat = () => {
			fetch("/api/active-user", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ guestId })
			})
		}

		sendHeartbeat() // initial
		const interval = setInterval(sendHeartbeat, 30000) // every 30 seconds

		return () => clearInterval(interval)
	}, [])

	const pathname = usePathname()

	return (
		<html lang="en">
			<body>
				{!NoNavRoutes.some(route => pathname.startsWith(route)) && <Navbar />}
				<Providers>
					<main className={`flex-grow container mx-auto px-4 py-8 ${inter.className}`}>
						{children}
					</main>
					{!NoNavRoutes.some(route => pathname.startsWith(route)) && <FooterComponent/>}
				</Providers>
				<ToastContainer position="bottom-right"/>
			</body>
		</html>
	)
}