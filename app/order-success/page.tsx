

import OrderSuccessPage from "@/components/OrderSuccessPage";
import { Suspense } from "react";

export const dynamic = "force-dynamic"

 export default function OrderSuccess () {

    return (
        <Suspense>
            <OrderSuccessPage/>
        </Suspense>
    )
 }
  
