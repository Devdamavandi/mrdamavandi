



import { useEffect, useState } from "react"


type CategoryWithCounts = {
    id: string
    name: string
    slug: string
    image: string | null
    productCount: number
}


export const useCategoryCounts = () => {
    const [categories, setCategories] = useState<CategoryWithCounts[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    

    useEffect(() => {
        const fetchCategories = async () => {

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/count`)

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
