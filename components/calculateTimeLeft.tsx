

'use client'



const calculateTimeLeft = (endTime: Date | null) => {

    if (!endTime) return {hours: 0, minutes: 0}

    const now = new Date().getTime()
    const target = new Date(endTime).getTime()
    const diff = target - now

    const days = Math.floor( diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor( diff / (1000 * 60 * 60) % 24)
    const minutes = Math.floor( diff / (1000 * 60) % 60)
    const seconds = Math.floor( diff / (1000) % 60)
    
    return {days: Math.max(days, 0), hours: Math.max(hours, 0), minutes: Math.max(minutes, 0), seconds: Math.max(seconds, 0)}
}
 
export default calculateTimeLeft;