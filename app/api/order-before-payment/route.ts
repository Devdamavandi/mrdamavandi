import { createOrder } from "@/actions/order"

export async function POST(req: Request) {

    const body = await req.json()
    const order = await createOrder(body)
    return Response.json(order)
}