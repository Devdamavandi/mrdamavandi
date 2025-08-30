import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export const isProductNew = (createdAt: Date, daysThreshold = 30) => {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
  
  return diffInDays <= daysThreshold
}


// Create an instagram-like count format
export const formatCount = (n: number) => {
  if (n < 1000) return n.toString();
  if (n < 1000000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
  return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
}