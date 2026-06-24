

'use client'

import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { signOut } from "next-auth/react";

const ResetPasswordPage = () => {


    const [currentPassword, setCurrentPassword] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    
    const [inputError, setInputError] = useState('')
    const [successOpen, setSuccessOpen] = useState(false)
    
    const { data: session, status } = useSession()

    


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!session?.user?.id) return setInputError('Not Signed in')
        if (!currentPassword || !password) return setInputError('Fill all fields')
        if (password !== confirmPassword) return setInputError("Passwords don't match")
        
        const res = await fetch('/api/auth/reset-password', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userId: session.user.id ,currentPassword, newPassword: password})
        })

        if (res.ok) {
            setSuccessOpen(true)
            setInputError('')
        } else {
            const data = await res.json()
            setInputError(data.error ?? "Something went wrong")
        }
    }

    if (status === "loading") return <p>Loading...</p>

    
    return (
        <>
            {/* RESET */}
            <div className="h-screen flex flex-col items-center justify-center mx-auto max-w-lg">
                <form onSubmit={handleSubmit} className="w-full space-y-2 mx-4">
                    <h1 className="text-2xl text-center mb-6">Change Your Password</h1>
                    <input 
                        type="password"
                        placeholder="Current Password"
                        onChange={(e) => setCurrentPassword(e.target.value ?? "")}
                        className="w-full p-4 font-light border border-gray-200 rounded-md"
                    />
                    <input 
                        type="password"
                        placeholder="New Password"
                        onChange={(e) => setPassword(e.target.value ?? "")}
                        className="w-full p-4 font-light border border-gray-200 rounded-md"
                    />
                    <input 
                        type="password"
                        placeholder="Confirm New Password"
                        onChange={(e) => setConfirmPassword(e.target.value ?? "")}
                        className="w-full p-4 font-light border border-gray-200 rounded-md"
                    />
                    {inputError && <p className="text-sm text-red-500">{inputError}</p>}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-black text-white cursor-pointer"
                    >
                        Reset Password
                    </button>
                </form>
            </div>

            {/* SUCCESS MODAL */}
            <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Password Updated</AlertDialogTitle>
                        <AlertDialogDescription>Your password has been successfully changed.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction 
                            onClick={() => signOut({ callbackUrl: `${window.location.origin}/auth/login` })} 
                            className="w-1/2 h-10 border border-gray-200 mt-4 mx-auto hover:bg-gray-100 cursor-pointer text-lg font-normal">ok</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )  
}
 
export default ResetPasswordPage;