import { useEffect, useState } from "react"


export type DeviceType = "mobile" | "min-tablet" | "tablet" | "desktop"

export function useDeviceType(): DeviceType {
    const [deviceType, setDeviceType] = useState<DeviceType>("mobile")

    useEffect(() => {
        function getDeviceType() {
            const w = window.innerWidth
            if (w < 481) return "mobile"
            if (w < 768) return "min-tablet"
            if (w < 1024) return "tablet"
            return "desktop"
        }
        setDeviceType(getDeviceType())

        const handleResize = () => setDeviceType(getDeviceType())
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])
    
    return deviceType
}