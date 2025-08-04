import { groq } from "next-sanity";
import { client } from "./client";

export const productByIdQuery = groq`
*[_type == "productContent" && _id == $id][0]{
    name,
    slug,
    images[]{asset->{url}},
    whatsInTheBox,
    richDescription[]{
        ...,
        _type == "image" => {
            "url": asset->url,
            alt,
            caption
        }
    },
    tags,
    brand,
    specs,
    seo
}`;


export async function fetchSanityData(sanityId: string) {
    if (!sanityId) return null
    return await client.fetch(productByIdQuery, { id: sanityId })
}
