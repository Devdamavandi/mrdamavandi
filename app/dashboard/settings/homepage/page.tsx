

'use client'

import { SettingSchema } from "@/types/zod"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"



const HomepageSettings = () => {

    const [settings, setSettings] = useState<{ [key: string]: string | number }>({ 
        footerCategoriesCount: "5"
     })

    const handleData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSettings(prev => ({ ...prev, [name]: value }))
    }

    const handleSettings = async () => {
        try {
            const res = await fetch('/api/settings?type=homepage', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(settings)
        })

        if (!res.ok) throw new Error('Something has went wrong!!')
        toast.success('Your Changes has been Saved!')
        } catch (err) {
            toast.error(`${err}`)
        }
    }

    useEffect(() => {
        const loadSettings = async () => {
            const res = await fetch('/api/settings?type=homepage')
            const data = await res.json()
            const loaded = Object.fromEntries(data.map((s: SettingSchema) => [s.key, s.value]))
            setSettings(prev => ({ ...prev, ...loaded }))  // merge with defaults
        }
        loadSettings()
    }, [])

    return ( 
        <div className="p-4 mt-2">
            <h1 className="font-bold underline underline-offset-4">HOMEPAGE SETTING</h1>
            <ol className="flex space-x-2 items-center pt-10">
                <li>
                    <span>how many categories to be shown on homepage footer: </span>
                    <input 
                        type="number" 
                        name="footerCategoriesCount"
                        className="border border-gray-300 w-14 py-0.5 rounded text-center"
                        value={settings.footerCategoriesCount ?? ""}
                        onChange={handleData}
                         />
                </li>
            </ol>
            <button 
                className="mt-4 px-4 py-2 bg-purple-400 hover:bg-purple-500 text-white rounded cursor-pointer text-sm"
                onClick={handleSettings}>
                save
            </button>
        </div>
     )
}
 
export default HomepageSettings;