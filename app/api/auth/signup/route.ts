import {prisma} from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {

    try {
        const body = await req.json()
        const {name, email, password} = body

        const hashedPassword = await bcrypt.hash(password, 10)

        const existingUser = await prisma.user.findUnique({
            where: {name, email}
        })
        if (existingUser?.name) {
            return NextResponse.json({ error: 'Username already Exists!!' }, {status: 422})
        } else if (existingUser?.email) {
            return NextResponse.json({ error: 'Email already Exists!!' }, {status: 422})
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })
        return NextResponse.json(user, {status: 201})
    } catch {
        return NextResponse.json({ error: 'Something went wrong!!' }, {status: 500})
    }
}