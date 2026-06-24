import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"




export async function PUT(req: Request) {

    try {
        const { userId, currentPassword, newPassword } = await req.json()

        if (!userId || !currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing userId, currentPassword or newPassword' }, { status: 400 })
        }

       const user = await prisma.user.findUnique({ where: { id: userId } })
       if (!user || !user.password) return NextResponse.json({ error: "User Not Found" }, { status: 404 })

       const isMatch = await bcrypt.compare(currentPassword, user.password)
       if (!isMatch) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })

       const hashed = await bcrypt.hash(newPassword, 10)
       await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
       
       return NextResponse.json({ message: 'Password updated' }, { status: 200 })
        
    } catch (error) {
        console.error('Failed to update password in server: ', error)
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }
}