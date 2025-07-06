

import { Suspense } from "react"
import OrderSuccessPage from '@/components/OrderSuccessPage'


export default function OrderSuccess() {
    return (
         <Suspense fallback={<div>Loading...</div>}>
            <OrderSuccessPage />
         </Suspense>
    )
}