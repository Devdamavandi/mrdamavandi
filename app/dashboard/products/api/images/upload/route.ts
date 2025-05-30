


import {v2 as cloudinary} from 'cloudinary' 
import { NextResponse } from 'next/server'


cloudinary.config({
    cloud_name: 'dyixn15yk',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})



export async function POST(req: Request) {

   try {
    // 1. Get Formdata ( not JSON! )
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
        return NextResponse.json({
            error: 'No file uploaded'
        }, {status: 400})
    }


    // 2. Conver file to buffer
    const buffer = await file.arrayBuffer()
    const bytes = Buffer.from(buffer)


    // 3. Upload to Cloudinary
    const res = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'products'}, 
            (error, result) => {
                if (error) reject(error)
                if (!result) reject(new Error('No result from upload'))
                else resolve(result)
            }
        ).end(bytes)
    })

    return NextResponse.json({
        url: res.secure_url
    })
   } catch {
    return NextResponse.json(
        { error: 'Upload failed' },
        { status: 500 }
      );
   }
}