import { useState } from "react";



interface searchProps{
    searchQuery: string
}

const SearchBarComp = ({searchQuery} : searchProps) => {
    const [searchTerm, setSearchTerm] = useState<string>("")


    return ( 
        <div>
            <input 
                type="text"
                placeholder="Type Anything..."
                value={searchTerm}
                onChange={() => setSearchTerm(searchQuery)}
             />
        </div>
     );
}
 
export default SearchBarComp;