


import { client } from "./client"


export async function createSanityProductDoc(name: string, slug: string) {

    const doc = {
        _type: 'productContent',
        name,
        slug: { current: slug }
    }

    const created = await client.create(doc)
    return created._id

}

