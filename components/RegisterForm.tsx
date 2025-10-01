



'use client'

import { Button } from "@/components/ui/button";
import { UserSchema } from "@/types/zod";
import { useForm } from "react-hook-form";
import { User as RxAvatar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {FcGoogle} from 'react-icons/fc'
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { FaGithub } from "react-icons/fa";
import { inter, roboto } from "@/lib/fonts";



const RegisterForm = () => {
    const router = useRouter()
    
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    useEffect(() => {
        if (error) {
            toast.error('OAuth Signup failed. Please try again')
        }
    }, [error])

    const {handleSubmit, register, formState: {errors}} = useForm<UserSchema>({
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data: UserSchema)  => {

       try {
           const res = await fetch('/api/auth/signup', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify(data)
           })
           
           if (!res.ok) throw new Error("Signup failed!")

           router.push('/auth/login')
       } catch (error) {
        console.error('Registration error: ', error)
       }
    }


    return ( 
            <div className="flex justify-center items-center min-h-screen">
                <div>
                    <div className="max-w-lg">
                        <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-4 bg-indigo-50/20 gap-2 flex flex-col justify-center items-center min-h-screen">
                            {/* Icon */}
                            <RxAvatar
                                className="place-self-center text-indigo-300 mt-4 size-10"
                            />
            
                            <div className={`mt-4 space-y-1 ${roboto.className} font-light`}>
                                {/* username */}
                                <input
                                    type="text"
                                    id="name"
                                    {...register("name")}
                                    placeholder="username: John"
                                    className={`w-full p-4 border rounded-md bg-white ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                 />
                                {/* username */}
                                <input
                                    type="email"
                                    id="email"
                                    {...register("email")}
                                    placeholder="john@gmail.com"
                                    className={`w-full p-4 border rounded-md bg-white ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                 />
                                {/* username */}
                                <input
                                    type="password"
                                    id="password"
                                    {...register("password")}
                                    placeholder="●●●●●●"
                                    className={`w-full p-4 border rounded-md bg-white font-bold text-xl tracking-tight ${inter.className} ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                 />
                                {/* Submit Button */}
                                <div>
                                    <Button
                                        type="submit"
                                        className={`w-full py-7 bg-indigo-400 hover:bg-indigi-500 text-white text-xl cursor-pointer mt-4 ${roboto.className} font-light`}
                                    >
                                        Register
                                    </Button>
                                </div>
                            </div>
                             {/* OAuth Signup Buttons */}
                             <div className="grid grid-cols-1 w-full h-full mt-8">
                                <Button value='outline' className="hover:bg-indigo-100 cursor-pointer w-full py-6 outline-1"
                                    onClick={() => signIn('github')}
                                >
                                    <FaGithub style={{ 'width': 32, 'height': 32 }} />
                                </Button>
                                <Button value='outline' className="hover:bg-indigo-100 cursor-pointer w-full py-6 outline-1"
                                    onClick={() => signIn('google', {callbackUrl: '/dashboard'})}
                                >
                                    <FcGoogle style={{ 'width': 32, 'height': 32 }} />
                                </Button>
                             </div>
                             {/* Texts */}
                             <div className="flex flex-col w-full mt-4 pt-2 text-center">
                                <Link href={'/auth/login'} className="text-sm hover:text-blue-500">Already have an account?</Link>
                                <Link href={'/'} className="text-sm hover:text-blue-500">Back Home ⇽ </Link>
                             </div>
                        </form>
                    </div>
                </div>
            </div>
     )
}
 
export default RegisterForm;