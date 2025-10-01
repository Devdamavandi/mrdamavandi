
'use client'

import TopNavigationNav from "@/components/dashboard/top-nav";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { poppins } from "@/lib/fonts";
import axios from "axios";
import { useEffect, useState } from "react";

const ProfilePage = () => {

    const session = useSession()

    const [isUploading, setIsUploading] = useState(false)
    const [profileImage, setProfileImage] = useState(session?.data?.user?.image || '/default-image.jpg')
    
    console.log(session?.data?.user)

    // Sync the local Profile Image with the altest session user Image.
    useEffect(() => {
        if (session?.data?.user?.image) {
            setProfileImage(session.data.user.image)
        }
    }, [session?.data?.user?.image])

    // Upload Customer Profile Image to the Cloud and Save its address to the database
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // to get 1 file from the Add Images window
        const file = e.target.files?.[0]
        const email = session?.data?.user?.email || ''

        if (!file) return

        // Do not allow Files bigger than 2MB
        const maxSize = 2 * 1024 * 1024
        if (file.size > maxSize) {
            alert("You profile Image is too large!! Please choose a file under 2MB.")
            e.target.value = ""
            return
        }

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('email', email)
            
            // Upload to cloudinary
            const res = await axios.post('/dashboard/customer/profile/upload-to-cloud', formData)

            const userId = session?.data?.user?.id || '' || null
            const imageUrlString = res?.data?.url

            // Set to the state variable in order to get shown on the page
            setProfileImage(imageUrlString)

            // Send Profile-Image to API to get saved on the database
            await axios.post('/dashboard/customer/profile/save-image', {
                userId,
                imageUrlString
            })

            // Refresh session to get the new Image
            if (session.update) {
                await session.update()
            }

        } catch {
            alert("Failed to upload or save profile image. Please try again.")
        } finally {
            setIsUploading(false)
        }

    
    }
    
    return ( 
        <div>
            {session?.data?.user?.role === 'ADMIN' && <TopNavigationNav/>}
            <div className="flex flex-col p-10">
                <form className="space-y-8">
                    <div className="space-x-2">
                        <input defaultValue={session?.data?.user?.name || ''} className="bg-slate-50 p-2 rounded border border-slate-300"/>
                        <input defaultValue={session?.data?.user?.email || ''} className="bg-slate-50 p-2 rounded border border-slate-300" />
                    </div>

                    {/* Profile Picture */}
                    <div className="flex flex-col gap-1">
                        <label className={`${poppins.className}`}>Profile Image:</label>
                        <Image
                        src={profileImage}
                        width={200}
                        height={200}
                        alt={session?.data?.user?.name || "User profile image"}
                        className="border border-slate-200 rounded"
                        />
                        {/* Button */}
                        <div className="text-nowrap flex">
                            <input
                                id="profile-image"
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={isUploading}
                                className="hidden"
                            />
                            <label htmlFor="profile-image"
                                className={`px-8 py-2 rounded cursor-pointer 
                                    ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                            >
                                {isUploading ? 'Uploading...' : 'Add/Update Image'}
                            </label>
                        </div>
                    </div>
                    {session?.data?.user?.role === 'ADMIN' && <p>Role: {session?.data?.user?.role}</p>}
                </form>
            </div>
        </div>
     )
}
 
export default ProfilePage


