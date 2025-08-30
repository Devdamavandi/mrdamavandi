
'use client'

import { GetReviews, UpdateReview } from '@/actions/review'
import {useEffect, useState} from 'react'
import { Poppins } from 'next/font/google';
import TrimText from '@/lib/trimText';
import { RxAvatar } from "react-icons/rx";
import Image from 'next/image';
import TopNavigationNav from '@/components/dashboard/top-nav';
import { useSession } from 'next-auth/react';
import { ReviewsSchema } from '@/types/zod';

const poppins =Poppins({
    subsets: ['latin'],
    weight: '300'
})



const ReviewsPage = () => {


    const {data: session} = useSession()
    
    const [reviews, setReviews] = useState<ReviewsSchema[]>([])
    const [moreClicked, setMoreClicked] = useState(false)
    const [trimmedComment, setTrimmedComment] = useState<string[]>([])

    useEffect(() => {
        console.log(session?.user)
    }, [session?.user])
    
    useEffect(() => {
        GetReviews()
        .then(setReviews)
        .catch(console.error)
    }, [])
    
    useEffect(() => {
        setTrimmedComment(reviews.map(review => review.comment && TrimText(review.comment, 35)))
    }, [reviews])


    const handleComment = (cmnt: string, idx: number) => {
        /** "If the 'more' button has not been clicked yet,
         *  and the currently displayed comment is not the full comment,
         *  then show the full comment when the button is clicked." */
        if (!moreClicked && trimmedComment[idx] !== cmnt) {
            setMoreClicked(true)
            setTrimmedComment(prev =>
                prev.map((comment, i) => i === idx ? cmnt : comment)
            )
            return cmnt
        } else {
            setMoreClicked(false)
            setTrimmedComment(prev =>
                prev.map((comment, i) => i === idx ? TrimText(cmnt, 35) : comment)
            )
        }
    }

    const handleChecked = async (selectedId: string, checkedValue: boolean) => {
        await UpdateReview(selectedId, checkedValue)
    } 


    return ( 
        <div>
            <TopNavigationNav/>
            <div className="p-2 mt-6 shadow-md rounded">
                <div className="p-2">
                    <h1 className="mb-4">Reviews</h1>
                    <table>
                        <thead>
                            <tr className={`bg-purple-100 rounded-md ${poppins.className}`}>
                                <th className='py-2 px-4 font-light'>profile</th>
                                <th className='py-2 px-4 font-light'>name</th>
                                <th className='py-2 px-4 font-light'>email</th>
                                <th className='py-2 px-4 font-light'>comment</th>
                                <th className='py-2 px-4 font-light'>visible On Homepage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review, idx) => (
                                <tr key={review?.id} className='border-b-gray-200/65 border-b-[1px]'>
                                    <td className='py-2 px-4 place-items-center'>
                                        {review.user.image ? (
                                            <Image src={review.user.image} alt={`user-image ${idx}`} width={32} height={32} className='rounded-full size-10 object-cover'/>
                                        ) : (
                                            <RxAvatar className='w-6 h-6'/>
                                        )}
                                    </td>
                                    <td className='py-2 px-4 text-center text-sm'>{review.user.name}</td>
                                    <td className='py-2 px-4 text-center text-sm'>{review.user.email}</td>
                                    <td className='py-2 px-4 text-left text-sm'>{trimmedComment[idx]}
                                        <button
                                            className='text-blue-400 cursor-pointer hover:text-blue-500'
                                            onClick={() => handleComment(review.comment, idx)}>&nbsp;more
                                        </button>
                                    </td>
                                    <td className='text-center'>
                                        <input
                                            type='checkbox'
                                            checked={review.isChecked}
                                            className='w-4.5 h-4.5 align-middle accent-purple-400'
                                            onChange={(e) => handleChecked(String(review.id), e.target.checked)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
     )
}
 
export default ReviewsPage;