import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"




export async function GET(req: Request) {

    const { searchParams } = new URL(req.url)
    const settingsType = searchParams.get("type") || "homepage"
    
    const data = await prisma.settings.findMany({
        where: {
            category: settingsType
        }
    })

    return NextResponse.json(data)
}


export async function POST(req: Request) {

    try {

        const { searchParams } = new URL(req.url)
        const category = searchParams.get("type") || "homepage"
        
        const body = await req.json()
        // body should be an object of { key: value } pairs
        const settingsArray = Object.entries(body).map( ([key, value])  =>  ({
            key,
            value: String(value),
            category
        }))

        const updatedSettings = await prisma.$transaction(
            settingsArray.map(setting => 
                prisma.settings.upsert({
                where:  { key: setting.key },
                update: { value: setting.value, category: setting.category },
                create: { key: setting.key, value: setting.value, category: setting.category }
                })
            )
        )

        return NextResponse.json(updatedSettings)
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: 'Error Creating settings(in server)'}, {status: 500})
        }
    }
}