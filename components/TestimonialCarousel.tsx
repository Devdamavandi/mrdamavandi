import { GetReviews } from "@/actions/review";
import { ReviewsSchema } from "@/types/zod";
import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";
import Image from "next/image";
import { RxAvatar } from "react-icons/rx";
import { poppins } from "@/lib/fonts";






const TestimonialCarouselPage = () => {

    const [reviews, setReviews] = useState<ReviewsSchema[]>([])

    useEffect(() => {
        const getReviewsFunction = async () => {
            const res = await GetReviews()
            setReviews(res)
        }
        getReviewsFunction()
    }, [])

    console.log("Testimonial Carousel Result: ", reviews)
    
    return ( 
        <div>
            <Carousel className="w-full">
                <CarouselContent className="self-center">
                    {reviews?.map(review => (
                        <CarouselItem key={review.id} className="flex basis-[268px] md:basis-[400px] lg:basis-[500px] ">
                            <div className="bg-white p-10 rounded-md shadow-md flex border border-gray-300/45">
                                {review?.user?.image ? (
                                    <Image src={review.user.image} width={48} height={48}  alt={`reviewImage ${review.user.name}`} className="object-cover size-16 rounded-full"/>
                                ) : (
                                    <RxAvatar className="w-6 h-6" />
                                )}
                                <div className="flex flex-col px-2">
                                    <p style={{ fontWeight: 200 }} className={`${poppins.className}`}>{review?.comment}</p>
                                    <p>{review?.user?.name}</p>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
     )
}
 
export default TestimonialCarouselPage;