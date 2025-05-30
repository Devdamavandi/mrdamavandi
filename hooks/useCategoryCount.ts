



import { prisma } from "@/lib/db"
import { useEffect, useState } from "react"


type CategoryWithCounts = {
    id: string
    name: string
    slug: string
    image: string | null
    path: string[]
    parentId: string | null
    depth: number
    createdAt: Date | null
    updatedAt: Date | null
    _count: {
        products: number
    }
    children: Array<{
        _count: {
            products: number
        }
    } & Omit<CategoryWithCounts, 'children'>>
    totalProducts: number
}

export const useCategoryCounts = () => {
    const [categories, setCategories] = useState<CategoryWithCounts[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    

    useEffect(() => {
        const fetchCategories = async () => {

            try {
                const response = await fetch('/api/categories/count')

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json()
                setCategories(data)
            } catch (error) {
                console.error('Failed to fetch categories: ', error)
                setError(error instanceof Error ? error.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, [])

    return {categories, loading, error}

}