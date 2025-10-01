




'use client'

import { Button } from "@/components/ui/button";
import { type LoginSchema, loginZodSchema } from "@/types/zod";
import { useForm } from "react-hook-form";
import { User as RxAvatar } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {FcGoogle} from 'react-icons/fc'
import Link from "next/link";
import { toast } from "react-toastify";
import {signIn} from 'next-auth/react'
import { useEffect, useState } from "react";
import {zodResolver} from '@hookform/resolvers/zod'
import { FaGithub } from 'react-icons/fa'
import { roboto } from "@/lib/fonts";


const LoginPage = () => {

    const [isLoading, setIsLoading] = useState(false)


    const searchParams = useSearchParams()
        const error = searchParams.get('error')
    
        useEffect(() => {
            if (error) {
                if (error === 'OAuthAccountNotLinked') {
                    toast.error("This email is already registered. Linking accounts...")
                } else {
                    toast.error('Authentication failed. Please try again.')
                }
            }
        }, [error])

    const {handleSubmit, register, formState: {errors}} = useForm<LoginSchema>({
        resolver: zodResolver(loginZodSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (data: LoginSchema)  => {
        
        setIsLoading(true)
       try {
           const res = await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: true,
            callbackUrl: '/dashboard'
           }) as { error?: string } | undefined;

           console.log('SignIn Response: ', res)
           
           if (res && res.error) {
            toast.error(res.error === 'CredentialsSignIn'
                ? 'Invalid email or password'
                : 'Login failed'
            )
           }
       } catch (error) {
        console.error('Login error: ', error)
        toast.error('An unexpected error occurred!!')
       }
       finally {
        setIsLoading(false)
       }
    }

    const handleOAuthSignIn = async (provider: "github" | "google") => {
        try {
            setIsLoading(true);
            const result = await signIn(provider, {
                redirect: true,
                callbackUrl: '/dashboard'
            });
            return result
        } catch (error) {
            console.error(`${provider} sign-in error:`, error);
            toast.error(`Failed to sign in with ${provider}`);
        } finally {
            setIsLoading(false);
        }
    };
    return ( 
            <div className="flex items-center justify-center min-h-screen">
                <div>
                    <div className="max-w-lg">
                        <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-4 bg-indigo-50/20 flex flex-col justify-center items-center min-h-screen gap-2">
                            {/* Icon */}
                            <RxAvatar
                                className="place-self-center text-indigo-300 mt-4 size-10"
                            />
                            <div className={`mt-4 ${roboto.className} font-light`}>
                                {/* Email */}
                                <input
                                    type="email"
                                    id="email"
                                    {...register("email")}
                                    placeholder="john@gmail.com"
                                    className={`w-full p-4 mb-1 border rounded-md bg-white ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                 />
                                 {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                                {/* Password */}
                                <input
                                    type="password"
                                    id="password"
                                    {...register("password")}
                                    placeholder="**********"
                                    className={`w-full p-4 border rounded-md bg-white ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                 />
                                 {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                                {/* Submit Button */}
                                <div>
                                    <Button
                                        type="submit"
                                        className={`w-full py-7 bg-indigo-400 hover:bg-indigo-500 text-white text-xl cursor-pointer mt-4 ${roboto.className} font-light`}
                                        disabled={isLoading}
                                    >
                                        Login
                                    </Button>
                                </div>
                            </div>
                            {/* OAuth Signup Buttons */}
                            <div className="grid grid-cols-1 w-full h-full mt-8">
                                <Button value='outline' className="hover:bg-indigo-100 cursor-pointer w-full py-6 outline-1"
                                    type="button"
                                    onClick={() => handleOAuthSignIn('github')}
                                ><FaGithub style={{ 'width': 32, 'height': 32 }}/>
                                </Button>
                                <Button value='outline' className="hover:bg-indigo-100 cursor-pointer w-full py-6 outline-1"
                                    type="button"
                                    onClick={() => handleOAuthSignIn('google')}
                                >
                                    <FcGoogle style={{ 'width': 32, 'height': 32 }}/>
                                </Button>
                            </div>
                            {/* Texts */}
                            <div className={`flex flex-col w-full mt-2 pt-2 text-center`}>
                                <Link href={'/auth/register'} className="text-sm hover:text-blue-500">dont have an account?</Link>
                                <Link href={'/'} className="text-sm hover:text-blue-500">Back Home ⇽ </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
     )
}
 
export default LoginPage;