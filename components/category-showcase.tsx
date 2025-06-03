

'use client'
import { useCategoryCounts } from "@/hooks/useCategoryCount";
import { useRouter } from "next/navigation";
import CategoryCard from "./categoryCard";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";


const CategoryShowcase = () => {

    const {categories, loading, error} = useCategoryCounts()
    const [isMounted, setIsMounted] = useState(false)
    const router = useRouter()

    useEffect(() => {
      setIsMounted(true)
    },[])

    if (!isMounted) return null
    if (loading) return <div>Loading...</div>
    if (error) return <div>Error loading categories: {error}</div>
    
    return ( 
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {categories
                ?.filter((cat) => cat.depth !== undefined && cat.depth < 1)
                .map((category) => (
                  <CarouselItem key={category.id} className="basis-[180px] sm:basis-[210px]">
                    <CategoryCard
                      key={category.id}
                      name={category.name}
                      image={category.image || ''}
                      count={category.totalProducts || 0}
                      onClick={() => router.push(`/categories/${category.slug}`)}
                      className="cursor-pointer"
                    />
                  </CarouselItem>
                ))
              }
            </CarouselContent>
            {/* Carousel Navigation Arrows */}
              <CarouselPrevious className="absolute md:left-[-50px] lg:left-[-50px] top-1/2 -translate-y-1/2 size-16 cursor-pointer  transition-all duration-200 "/>
              <CarouselNext className="absolute md:right-[-50px] lg:right-[-50px] top-1/2 -translate-y-1/2 size-16 cursor-pointer transition-all duration-200 " />
          </Carousel>
        </div>
     )
}
 
export default CategoryShowcase;