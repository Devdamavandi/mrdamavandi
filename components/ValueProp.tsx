


interface ValuePropProps {
    icon: React.ReactNode
    title: string
    description?: string // Optional extra text
}


const ValueProp = ({icon, title}: ValuePropProps) => {
    return ( 
        <div className="flex items-center gap-3 p-4">
            <div className="bg-blue-50 p-2 rounded-full">
                {icon}
            </div>
            <div>
                <h3 className="font-medium">{title}</h3>
                {/* <p className="text-sm text-gray-500">{description}</p> */}
            </div>
        </div>
     )
}
 
export default ValueProp;