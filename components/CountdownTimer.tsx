



import { useEffect, useState } from "react";
import calculateTimeLeft from "./calculateTimeLeft";

const CountdownTimer = ({endTime, compact=false}: {endTime: Date | null, compact?: boolean}) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime))



    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(endTime))
        }, 1000)
        return () => clearInterval(timer)
    }, [endTime])
    
    return ( 
        <div className={`flex items-center gap-1 text-sm bg-white px-2 py-1 rounded-md ${compact ? 'text-xs' : ''}`}>
            <span className={`${compact && 'text-xs'} text-lg`}>{timeLeft.days}d</span>
            <span className="font-bold">{timeLeft.hours}h</span>
            <span>{timeLeft.minutes}m</span>
            <span>{timeLeft.seconds}s</span>
        </div>
     );
}
 
export default CountdownTimer;