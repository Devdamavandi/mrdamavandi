import {prisma} from "./db"




export const getUSerById = async(id: string) => {
    try {
        const foundUserId = await prisma.user.findUnique({
            where: { id }
        })
        return foundUserId
    } catch {
        return null
    }
}


export const getUserByEmail = async (email: string) => {
    try {
        const foundEmail = await prisma.user.findFirst({
            where: {email}
        })
        return foundEmail
    } catch {
        return null
    }
}