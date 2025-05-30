


import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
    cloud_name: 'dyixn15yk',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


export async function POST(req:Request) {

    try {
        // 1. Get FormData ( Not JSON! )
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({
                error: 'No File Uploaded to Server!'
            } , {status: 400})
        }

        // 2. Convert file to buffer
        const buffer = await file.arrayBuffer()
        const bytes = Buffer.from(buffer)

        // 3. Upload to Cloudinary
        const res = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream({ folder: 'CategoryCoverImages'},
                (error, result) => {
                    if (error) reject (error)
                    if (!result) reject(new Error('No result from upload'))
                    else resolve(result)
                }
            ).end(bytes)
        })

        return NextResponse.json({
            url: res.secure_url
        })
        
    } catch {
        return NextResponse.json({
            error: 'upload failed'
        } ,  {status: 500})
    }
}