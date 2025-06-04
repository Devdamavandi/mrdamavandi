



'use client'

import { Button } from "@/components/ui/button";
import { UserSchema } from "@/types/zod";
import { useForm } from "react-hook-form";
import { RxAvatar } from "react-icons/rx";
import { useRouter, useSearchParams } from "next/navigation";
import {FcGoogle} from 'react-icons/fc'
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "react-toastify";



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
            <div className="flex justify-center items-center h-[90vh] ">
                <div className="w-4/12 h-[30rem]">
                    <div className="w-full h-full">
                        <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-4 bg-gray-50 flex flex-col justify-between h-full w-full">
                            {/* Icon */}
                            <RxAvatar
                                className="place-self-center h-full w-full text-blue-600 mt-4 mb-6"
                            />
            
                            {/* username */}
                            <div className="space-y-2">
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
                                    placeholder="**********"
                                    className={`w-full p-4 border rounded-md bg-white ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                 />
                            </div>
                            {/* Submit Button */}
                             <div>
                                 <Button
                                    type="submit"
                                    className="w-full py-6 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer mt-4"
                                 >
                                    Register
                                 </Button>
                             </div>
                             {/* OAuth Signup Buttons */}
                             <div className="grid grid-cols-2 gap-2 w-full mt-4">
                                <Button value='outline' className="hover:bg-gray-200 cursor-pointer px-4 py-2 w-full text-lg font-normal text-black/65 shadow"
                                    onClick={() => signIn('github')}
                                >via Github</Button>
                                <Button value='outline' className="hover:bg-gray-200 cursor-pointer px-4 py-2 w-full text-lg font-normal text-black/65 shadow"
                                    onClick={() => signIn('google', {callbackUrl: '/dashboard'})}
                                >
                                    via
                                    <FcGoogle/>
                                </Button>
                             </div>
                             {/* Texts */}
                             <div className="flex flex-col w-full mt-4 text-center">
                                <Link href={'/auth/login'} className="text-xs hover:text-blue-500">Already have an account?</Link>
                                <Link href={'/'} className="text-xs hover:text-blue-500">Back Home ⇽ </Link>
                             </div>
                        </form>
                    </div>
                </div>
            </div>
     )
}
 
export default RegisterForm;