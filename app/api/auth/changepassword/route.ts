import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"




export async function PUT(req: Request) {

    try {
        const { userId, newPassword, newEmail } = await req.json()

        if (!userId || !newPassword) {
            return NextResponse.json({ error: 'Missing userId Or newPassword' }, { status: 400 })
        }

        const hashed = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: userId },
            data: { 
                email: newEmail,
                password: hashed
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to update password in server: ', error)
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }
}