


import { client } from "./client";


export async function createSanityProduct(
    data: 
    {
        name: string
        slug: string
        richDescription: string
        images?: string[]
        whatsInTheBox?: string[]
        tags?: string[]
        brand?: string
        specs?: { label: string; value: string }[]
        seo?: string
}) {

    return client.create({
        _type: 'productContent',
        ...data,
        slug: { _type: 'slug', current: data.slug}
    })
}