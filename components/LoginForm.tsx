




'use client'

import { Button } from "@/components/ui/button";
import { type LoginSchema, loginZodSchema } from "@/types/zod";
import { useForm } from "react-hook-form";
import { RxAvatar } from "react-icons/rx";
import { useSearchParams } from "next/navigation";
import {FcGoogle} from 'react-icons/fc'
import Link from "next/link";
import { toast } from "react-toastify";
import {signIn} from 'next-auth/react'
import { useEffect, useState } from "react";
import {zodResolver} from '@hookform/resolvers/zod'



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
            <div className="flex justify-center items-center h-[90vh] ">
                <div className="w-4/12 h-[26rem]">
                    <div className="w-full h-full">
                        <form onSubmit={handleSubmit(onSubmit)} className="px-5 pb-4 bg-gray-50 flex flex-col justify-between h-full w-full gap-2">
                            {/* Icon */}
                            <RxAvatar
                                className="place-self-center h-full w-full text-blue-600 mt-4"
                            />
                            {/* Email */}
                            <input
                                type="email"
                                id="email"
                                {...register("email")}
                                placeholder="john@gmail.com"
                                className={`w-full p-4 border rounded-md bg-white ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
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
                                    className="w-full py-6 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer mt-4"
                                    disabled={isLoading}
                                >
                                    Login
                                </Button>
                            </div>
                            {/* OAuth Signup Buttons */}
                            <div className="grid grid-cols-2 gap-2 w-full mt-4">
                                <Button value='outline' className="hover:bg-gray-200 cursor-pointer px-4 py-2 w-full text-lg font-normal text-black/65 shadow"
                                    type="button"
                                    onClick={() => handleOAuthSignIn('github')}
                                >login via Github
                                </Button>
                                <Button value='outline' className="hover:bg-gray-200 cursor-pointer px-4 py-2 w-full text-lg font-normal text-black/65 shadow"
                                    type="button"
                                    onClick={() => handleOAuthSignIn('google')}
                                >
                                    login via
                                    <FcGoogle/>
                                </Button>
                            </div>
                            {/* Texts */}
                            <div className="flex flex-col w-full mt-4 text-center">
                                <Link href={'/auth/register'} className="text-xs hover:text-blue-500">dont have an account?</Link>
                                <Link href={'/'} className="text-xs hover:text-blue-500">Back Home ⇽ </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
     )
}
 
export default LoginPage;