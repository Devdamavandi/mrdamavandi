

import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";



cloudinary.config({
    cloud_name: 'dyixn15yk',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



export async function POST(req: Request) {

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const email = formData.get('email') as string

        if (!file || !email) {
            return NextResponse.json({ error: 'No file or email Provided!' }, { status: 400 })
        }

        const buffer = await file.arrayBuffer()
        const bytes = Buffer.from(buffer)

        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: `profile-images/${email}` },
                (error, res) => {
                    if (error || !res) return reject(error || new Error('No result'))
                    resolve(res)
                }
            )
            stream.end(bytes)
        })

        return NextResponse.json({ url: result.secure_url }, { status: 200 })
    } catch (error) {
        console.error('Cloudinary upload error: ', error)
        return NextResponse.json({ error: (error as Error).message || 'Upload failed' }, { status: 500 })
    }
}