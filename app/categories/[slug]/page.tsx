

import ProductList from "./ProductList"


async function getProducts(slug: string, page = 1, limit = 10) {

    const res = await fetch(
        `${process.env.NEXTAUTH_URL}/categories/api?category=${slug}&page=${page}&limit=${limit}`,
        {  cache: 'no-store' }
    )

    if (!res.ok) throw new Error('Failed to fetch products(client side)')
    return res.json()
}


export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;

    const initialProducts = await getProducts(params.slug)

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Products in {params.slug}</h1>
            <ProductList slug={params.slug} initialProducts={initialProducts} />
        </div>
    )
}