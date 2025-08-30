
import redis from "./redis"

export async function userActive(userId: string) {
    const now = Date.now()
    await redis.set(`active:${userId}`, now, "EX", 40)   // 40s Expiry

    // Add to Today's visitor set
    const todayKey = `visitors:${new Date().toISOString().slice(0, 10)}` // e.g. visitors:2025-08-16
    await redis.sadd(todayKey, userId)
    await redis.expire(todayKey, 86400) // expire after 24h
}

export async function userInactive(userId: string) {
    await redis.del(`active:${userId}`)
}

export async function getActiveUserCount() {
    const keys = await redis.keys("active:*")
    return keys.length
}

export async function getActiveUsersToday() {
    const todayKey = `visitors:${new Date().toISOString().slice(0, 10)}` 
    return await redis.scard(todayKey) // count of unique visitors today
}