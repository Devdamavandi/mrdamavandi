

/** I CREATED THIS FILE JUST FOR FETCHING
 * ORDERS from getAllOrders() action FILE..!
 * because otherwise, I WOULDNT HAVE ANY WAY TO 
 * RETRIEVE ORDERS DIRECTLY FROM CLIENT-SIDE
 */

import { getRecentOrders } from "@/actions/order";

export async function GET(req: Request) {
    return await getRecentOrders(req)
}