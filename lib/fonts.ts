




import { 
    Poppins, 
    Bebas_Neue, 
    Roboto, 
    Inter, 
    Playfair_Display, 
    Cormorant,
    Cinzel,
    Prata,
    Montserrat
 }
 from 'next/font/google'



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

export const playfairDisplay = Playfair_Display({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900']
})

export const cormorant = Cormorant({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700']
})

export const cinzel = Cinzel({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900']
})

export const prata = Prata({
    subsets: ['latin'],
    weight: ['400']
})

export const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['100', '200','300','400','500','600','700','800','900']
})