import {prisma} from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { userZodSchema } from "@/types/zod"

export async function POST(req: Request) {

    
    try {
        const body = await req.json()
        const parsed = userZodSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid input.' }, { status: 400 })
        }
        
        const { name, email, password } = parsed.data

        const hashedPassword = await bcrypt.hash(password, 10)

        const existingEmail = await prisma.user.findUnique({
            where: { email }
        })
        if (existingEmail?.email) {
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
    } catch (error){
        console.error('Signup error from server: ', error)
        return NextResponse.json({ error: 'Something went wrong!!' }, {status: 500})
    }
}