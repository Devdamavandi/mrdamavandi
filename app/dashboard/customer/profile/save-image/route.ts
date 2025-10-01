import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"



export async function POST(req: Request) {
    try {
        
            const body = await req.json()
            const { userId, imageUrlString } = body
        
            const searchUser = await prisma.user.findUnique({
                where: { id: userId }
            })
        
            if (!searchUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
        
            const updatedImage = await prisma.user.update({
                where: { id: userId  },
                data: {
                    image: imageUrlString
                }
            })
        
            return NextResponse.json({ success: true, updatedImage })
    } catch (error) {
        console.error('Failed in updating User profile', error)       
        return NextResponse.json({ error: 'Failed in Updating the User Profile' }, { status: 500 })
    }
}