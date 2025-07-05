



'use client'

import CheckoutPageContent from '@/components/CheckoutPageContent'
import { Suspense} from 'react'


const CheckoutPage = () => {

   return (
     <Suspense fallback={<div>Loading...</div>}>
        <CheckoutPageContent />
    </Suspense>
   )

   
}
 
export default CheckoutPage;