


import Image from "next/image";
import { Card, CardContent } from "./ui/card";


interface categoryProps{
    key: string
    name: string
    image: string
    count: number
    onClick: () => void
    className: string
}


const CategoryCard = ({ name, image, count, onClick, className}: categoryProps) => {

    
    return ( 
        <Card className={`hover:scale-105 my-2 ${className}`} onClick={onClick}>
            <CardContent className="p-0 overflow-hidden">
                <div className="relative aspect-square w-full">
                    <Image src={image || '/image.png'}
                           alt={name}
                           fill 
                           priority 
                           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                           className="object-cover aspect-square px-2"
                           />
                    <div className="absolute bottom-2 left-2 right-2 bg-white/60 px-2 py-1 rounded-md backdrop-blur-lg">
                        <div className="flex items-center justify-between text-black px-2">
                            <p className="font-medium truncate">{name}</p>
                            <p>({count})</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
     )
}
 
export default CategoryCard;