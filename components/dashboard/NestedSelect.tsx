


import { CategorySchema } from "@/types/zod"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from "../ui/menubar"

interface NestedSelectProps {
    categories: CategorySchema[]
    value: string | undefined
    onChange: (value: string) => void
}

const NestedCategorySelect = ({categories, value, onChange} : NestedSelectProps) => {
    const [isOpen, setIsOpen] = useState(false)

    // Find selected category name
    const selectedName = value === ''
        ? 'Root (no parent)'
        : value
            ? categories.find(c => c.id === value)?.name
            : 'Select Parent'

    const handleSelection = (value:string) => {
        onChange(value)
        setIsOpen(false)
    }


    // Recursive Component for rendering category and its children
    const renderCategory = (category: CategorySchema) => {
        const children = categories.filter(c => c.parentId === category.id)

        return (
            <MenubarSub key={category.id}>
                <MenubarSubTrigger
                    onClick={() => handleSelection(category.id!)}
                    onPointerEnter={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="w-full justify-between items-center hover:bg-blue-400"
                >
                    {category.name}
                </MenubarSubTrigger>


                {children.length > 0 && (
                    <MenubarSubContent 
                        className="min-w-[200px]  bg-white text-black"
                        sideOffset={5}
                        alignOffset={-5}
                    >
                        {children.map(child => renderCategory(child))}
                    </MenubarSubContent>
                )}
            </MenubarSub>
        )
    }

    // Get root categories
    const rootCategories = categories.filter(c => !c.parentId)
  
   return (
    <div className="relative w-full">
        <Menubar className="border rounded-md p-0 w-[250px]">
            <MenubarMenu>
                <MenubarTrigger 
                    className="w-full justify-between bg-white "
                    onPointerEnter={(e) => e.preventDefault()}
                    onPointerLeave={(e) => e.preventDefault()}
                    onClick={() => setIsOpen(!isOpen)}
                    >
                    {selectedName}
                    <ChevronDown className="h-4 w-4 ml-2" />
                </MenubarTrigger>

                {isOpen && (
                    <MenubarContent className="bg-white min-w-[200px]"
                        onInteractOutside={() => setIsOpen(false)}
                    >
                        <MenubarItem 
                            className="cursor-pointer hover:bg-blue-400 hover:text-white"
                            onClick={() => handleSelection('')}
                            >
                            Root (No Parent)
                        </MenubarItem>

                        {rootCategories.map(category => renderCategory(category))}
                    </MenubarContent>
                )}
            </MenubarMenu>
        </Menubar>
    </div>
   )
}
 
export default NestedCategorySelect;