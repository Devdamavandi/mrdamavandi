



import { useState } from "react"


interface ColumnSettingsProps{
    visibleColumns: string[]
    onToggleColumn: (col: string) => void
}
const ColumnSettingsComponent = ({visibleColumns, onToggleColumn}: ColumnSettingsProps) => {

    return ( 
        <div>
            {['Category', 'Description', 'Created At'].map((col) => (
                <label key={col} className="flex items-center gap-2 mb-1">
                    <input type="checkbox" checked={visibleColumns.includes(col)} onChange={() => onToggleColumn(col)} />
                    {col}
                </label>
            ))}
        </div>
     )
}
 
export default ColumnSettingsComponent;

