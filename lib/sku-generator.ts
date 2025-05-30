

/**
 * Generates a Unique SKU based on product attributes
 * Format: CATEGORY-INITIALS-RANDOMNUM
 */


export const generateSKU = async (name: string, categoryId: string | null, variantAttributes?: Record<string, string>): Promise<string> => {

    // Base SKU Parts
    const categoryPrefix = categoryId 
        ? categoryId.slice(-4).toUpperCase()
        : 'GEN'

    const nameInitials = name
        .split(' ')
        .filter(word => word.length > 0) // Filter out empty strings    
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 3)
        .padEnd(3, 'X')

    const randomNum = Math.floor(1000 + Math.random() * 9000)

    // Base SKU
    let sku =  `${categoryPrefix}-${nameInitials}-${randomNum}`

    if (variantAttributes) {
        const variantCode = Object.values(variantAttributes)
            .map(val => val.slice(0, 3).toUpperCase())
            .join('')
        
        if (variantCode) {
            sku += `-${variantCode}`
        }
    }
    
    return sku
}