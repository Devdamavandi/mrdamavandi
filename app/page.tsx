'use client'

import CategoryShowcase from "@/components/category-showcase"
import DailyDealCard from "@/components/DailyDealCard"
import NewsletterForm from "@/components/NewsletterForm"
import ProductCard from "@/components/productCard"
import TestimonialCarouselPage from "@/components/TestimonialCarousel"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import ValueProp from "@/components/ValueProp"
import { useDeal, useProducts } from "@/hooks/useProducts"
import { roboto } from "@/lib/fonts"
import { isProductNew } from "@/lib/utils"
import { Headphones, RefreshCw, ShieldCheck, Truck } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {

 const {data: featuredProducts, isLoading, error} = useProducts()
 const {data: deal} = useDeal()
 const [endTime, setEndTime] = useState<Date | null>(null)



 useEffect(() => {
  setEndTime(deal?.dealEndTime ?? null)
  console.log(endTime)
 }, [deal?.dealEndTime, endTime])
 
  return (
    <div className="container mx-auto">
      {/*  HEADER SECTION */}
      <header className="relative h-[500px] bg-gradient-to-r from-blue-900 to-purple-800">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/40"/>
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-8 max-w-7xl mx-auto">
          <h1 className="md:text-5xl text-4xl font-bold text-white mb-4">Everything You Need, <span className="text-yellow-300">Delivered Fast</span></h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">Millions of products with free shipping on orders over $50</p>
        </div>
      </header>

      {/* Search Bar */}
      <div>
        {/* <SearchBarComp/> */}
      </div>


      {/* CATEGORY SHOWCASE ( Horizontal Scroll )*/}
      <section className="py-[5rem] max-w-7xl container mx-auto px-4">
        <h2 className="text-3xl font-bold mt-2 text-center mb-2 ">Shop by Category</h2>
        <CategoryShowcase/>
      </section>


      {/* Featured Products ( TRENDING NOW ) */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <Link href={'/products'} className="hover:text-blue-500 font-normal text-2xl">
              View All
            </Link>
          </div>
          <div className="w-full">
            {isLoading && <p>Loading</p>}
            {error && <p>Error Loaing Products!</p>}
            <Carousel className="w-full">
              <CarouselContent>
                  {featuredProducts?.map(product => (
                  <CarouselItem key={product.id} className="basis-[250px] md:basis-[300px] lg:basis-[340px] flex">
                    <ProductCard 
                      key={product.id}
                      id={product.id ?? ''}
                      variantId={product.variants?.find(v => v.isDefault)?.id || product.variants?.[0]?.id || ""}
                      name={product.name}
                      image={product.images?.[0] || '/default-image.jpg'}
                      price={product.variants?.find(v => v.isDefault)?.price || product.variants?.[0]?.price || 0}
                      stock={product.variants?.find(v => v.isDefault)?.stock || product.variants?.[0]?.stock || 0}
                      averageRating={product.averageRating}
                      badge={product.isOnSale ? "On Sale" : ""}
                      isNew={product.createdAt ? isProductNew(new Date(product.createdAt)) : false}
                      originalPrice={product.originalPrice}
                      hasFreeShipping={product.hasFreeShipping}
                      isBestseller={product.isBestSeller}
                      hreff={`/products/${product.slug}`}
                      WishlistItem={Array.isArray(product.WishlistItem) ? product.WishlistItem : []}
                    />
                </CarouselItem>
                  ))}
              </CarouselContent>
                <CarouselPrevious className="absolute lg:left-[-70px] top-1/2 -translate-y-1/2 size-16 cursor-pointer  transition-all duration-200 "/>
                <CarouselNext className="absolute lg:right-[-70px] top-1/2 -translate-y-1/2 size-16 cursor-pointer transition-all duration-200 " />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Value Propositions ( Trust Signals ) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t py-[5rem]">
              <ValueProp icon={<ShieldCheck/>} title="Secure Payments" />
              <ValueProp icon={<Truck/>} title="Free Shipping Over $50" />
              <ValueProp icon={<RefreshCw/>} title="Easy Returns" />
              <ValueProp icon={<Headphones/>} title="24/7 Support" />
      </div>


      {/* Deal of the Day ( Timer + Featured ) */}
        <section className="py-12 bg-rose-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-4 mb-6">
              <h2 className="text-3xl font-bold">Deal of the Day</h2>
              {deal?.isActive&& <p className="text-gray-600">Limited time offer - dont miss out!</p>}
            </div>

            
            {deal?.isActive ? (<DailyDealCard 
              id={deal.dailyDealProduct.id} 
              discountRate={deal.discountRate} 
              endTime={deal.dealEndTime}
              dealProductId={deal.dailyDealProduct.id}
            />)
            : 
            (
               <div className="bg-white p-6 rounded-lg shadow-md text-center">
                 <h3 className="text-xl font-medium text-gray-700">No active deal available!</h3>
                 <p className="text-sm text-gray-500 mt-2">Check back later for new deals!</p>
               </div>
            )
            }
          </div>
        </section>



      {/* Customer Testimonials  */}
        <section className="py-20">
          <h2 className="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
          <TestimonialCarouselPage  />
        </section>


        {/* Newsletter Signup */}
        <section className="w-1/2 py-16 place-self-center">
          <div className="text-center flex flex-col items-center text-nowrap">
            <h2 className={`${roboto.className} text-4xl pb-2`}>Get 10% Off Your First Order</h2>
            <p className="pb-2">Subscribe to our Newsletter for Exclusive deals</p>
            <NewsletterForm/>
          </div>
        </section>

    </div>
  )
}