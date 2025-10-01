




import { Poppins, Bebas_Neue, Roboto, Inter } from 'next/font/google'



export const poppins = Poppins({
    subsets: ['latin'],
    weight: ['100','200','300', '400', '500', '600', '700', '800', '900']
})


export const bebas = Bebas_Neue({
    subsets: ['latin'],
    weight: '400'
})

export const roboto = Roboto({
    subsets: ['latin'],
    weight: ['100','200','300', '400', '500', '600', '700', '800', '900']
})


export const inter = Inter({
	subsets: ['latin'],
	weight: '400'
})