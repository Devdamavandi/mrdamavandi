


import TopNavigationNav from "@/components/dashboard/top-nav";
import { auth } from "@/auth";
import Image from "next/image";

export default async function ProfilePage() {

    const session = await auth()
    
    return ( 
        <div>
            <TopNavigationNav/>
            <div className="flex flex-col p-10">
                <p>Name: {session?.user?.name}</p> 
                <p>Email: {session?.user?.email}</p>
                <Image
                    src={session?.user?.image || "/default-image.png"}
                    width={200}
                    height={200}
                    alt={session?.user?.name || "User profile image"}
                />
                <p>Role: {session?.user?.role}</p>
            </div>
        </div>
     )
}
 
