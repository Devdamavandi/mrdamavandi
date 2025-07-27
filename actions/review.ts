




'use server'
 
export async function GetReviews() {

    const res = await fetch(`${process.env.NEXTAUTH_URL}/dashboard/reviews/api`, {
        method: 'GET',
        cache: 'no-store'
    })

    if (!res.ok) throw new Error('Failed to fetch reviews!(action file)')
    return res.json()
}


export async function UpdateReview(selectedId: string, isChecked: boolean) {

    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/dashboard/reviews/api`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ selectedId, isChecked })
        })

        if (!res.ok) throw new Error('failed to fetch review(action file)')
    } catch (error) {
        console.error('Error updating review(action file)', error)
    }
}