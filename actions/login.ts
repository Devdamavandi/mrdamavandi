


'use server'

import { signIn } from "@/auth"
import { getUserByEmail } from "@/lib/userQueries"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { LoginSchema, loginZodSchema } from "@/types/zod"
// Removed AuthError import as it is not exported by @auth/core

export const login = async (values: LoginSchema) => {
    const validatedFields = loginZodSchema.safeParse(values)

    if (!validatedFields.success) {
        return {error: 'Invalid fields'}
    }

    const { email, password } = validatedFields.data

    const existingUser = await getUserByEmail(email)

    if (!existingUser || !existingUser.email) {
        return {error: 'Email does ont exist!!'}
    }

    if (!existingUser.password) {
        return {error: 'Please sign in using your OAuth provider!!'}
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: true,
            callbackUrl: DEFAULT_LOGIN_REDIRECT,
        })
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("CredentialsSignin")) {
                return {error: "Invalid credentials!!"}
            } else {
                return {error: "Something went wrong!!"}
            }
        }
        throw error
    }
} 