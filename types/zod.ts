
import {z} from 'zod'

export const variantZodSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(3, "SKU must be at least 3 characters"),
    isDefault: z.boolean().optional(),
    price: z.number().min(0.01, "Price must be at least 0.01"),
    discount: z.number().optional(),
    stock: z.number().int().min(0, "Stock cannot be negative"),
    attributes: z.object({
        color: z.string().optional(),
        size: z.string().optional()
    })
})

export const productShippingSchema = z.object({
    shipsIn: z.string(),
    shipsFrom: z.string(),
    shipsTo: z.string(),
    estimatedTime: z.string(),
    carrier: z.string().optional(),
    trackingNote: z.string().optional(),
    cost: z.number().optional()
})

export const productCountSchema = z.object({
    WishlistItem: z.number().optional()
})

export const productZodSchema = z.object({
    id: z.string().optional(), // Make ID optional for creation
    sanityId: z.string().optional(),
    name: z.string().min(1,'Name is required').max(100),
    slug: z.string().optional(),
    description: z.string().max(500).optional(),
    sku: z.string().min(3, "SKU must be at least 3 characters").max(50),
    price: z.number().min(0.01, 'Price must be at least 0.01'),
    WishlistItem: z.string().optional(),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    images: z.array(z.string().optional()),
    variants: z.array(variantZodSchema).optional(),
    averageRating: z.number().int(),
    createdAt: z.string().optional(),
    categoryId: z.string().optional(), // For form submission
    category: z.object({ //For API Responses
        id: z.string(),
        name: z.string()
    }).optional(),
    isNew: z.boolean().optional(),
    originalPrice: z.number().optional(),
    hasFreeShipping: z.boolean().optional(),
    returnGuarantee: z.boolean().optional(), 
    isOnSale: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    whatsInTheBox: z.object({
        html: z.string(),
        text: z.string(),
        images: z.array(z.string()).optional()
    }),
    ProductShipping: productShippingSchema.optional(),
    views: z.number().optional(),
    _count: productCountSchema.optional(),
    revenue: z.number().optional(),
    purchaseCount: z.number().optional()
})

export const categoryZodSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required').max(70),
    slug: z.string(),
    image: z.string().optional(),
    _count: z.object({ products: z.number().optional() }).optional(),
    parentId: z.string().optional(),
    parent: z.object({
        id: z.string(),
        name: z.string()
    }).optional(),
    children: z.array(z.object({
        id: z.string(),
        name: z.string()
    })).optional(),
    path: z.array(z.string().optional()),
    depth: z.number().optional() 
})

export const userZodSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2).max(50),
    email: z.string().min(1, "Email is required").email("invalid email format"),
    password: z.string().min(1, "Password is required").max(100),
    role: z.enum(["ADMIN", "EDITOR", "CUSTOMER"]).default("CUSTOMER"),
    image: z.string().url().optional(),
    emailVerified: z.date().optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
})

export const addressSchema = z.object({
    id: z.string().optional(),
    userId: z.string(),
    user: userZodSchema,
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    isDefault: z.boolean().optional()
})

export const wishlistZodSchema = z.object({
    id: z.string().optional(),
    userId: z.string(),
    user: z.string().optional(),
    productId: z.string(),
    product: z.string().optional()
})

export const reviewZodSchema = z.object({
    id: z.string(),
    name: z.string(),
    title: z.string(),
    comment: z.string(),
    rating: z.number(),
    product: productZodSchema,
    user: userZodSchema,
    approved: z.boolean().default(false),
    isChecked: z.boolean().default(false)
})

export const loginZodSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(1, "Password is required")
})

export const registerZodSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, {message: 'Minimum 6 characters required!'}),
    name: z.string().min(1, {message: 'name is required'})
})

export const dealZodSchema = z.object({
    id: z.string().optional(),
    dealName: z.string().min(1, "Deal name is required!"),
    dealEndTime: z.union([z.string(), z.date()]).transform(val => new Date(val)),
    dailyDealProduct: z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        sku: z.string().min(1).optional()
    }),
    discountRate: z.coerce.number().min(0).max(100),
    isActive: z.boolean().default(false),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional()
})

export const settingsZodSchema = z.object({
    id: z.string(),
    key: z.string(),
    value: z.string(),
    category: z.string()
})

export const orderItemSchema = z.object({
    id: z.string().optional(),
    orderId: z.string(),
    product: productZodSchema,
    productId: z.string(),
    variant: variantZodSchema.optional(),
    variantId: z.string().optional(),
    quantity: z.number(),
    priceAtPurchase: z.number()
})

export const orderZodSchema = z.object({
    id: z.string().optional(),
    orderNumber: z.string(),
    userId: z.string(),
    user: userZodSchema.optional(),
    items: z.array(orderItemSchema),
    shippingAddressId: z.string().optional(),
    shippingAddress: productShippingSchema,
    billingAddressId: z.string().optional(),
    billingAddress: addressSchema,
    subtotal: z.number().optional(),
    tax: z.number().optional(),
    shippingCost: z.number(),
    discount: z.number().optional(),
    total: z.number(),
    paymentMethod: z.enum(["CREDIT_CARD", "PAYPAL", "BANK_TRANSFER", "COD"]),
    paymentStatus: z.enum(["PENDINF", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
    status: z.enum(["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]).optional(),
    trackingNumber: z.string().optional(),
    carrier: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
})

export type ProductFormValues = z.infer<typeof productZodSchema>
export type CategorySchema = z.infer<typeof categoryZodSchema>
export type WishlistSchema = z.infer<typeof wishlistZodSchema>
export type UserSchema = z.infer<typeof userZodSchema>
export type ShippingSchema = z.infer<typeof productShippingSchema>

export type VariantFormValues = z.infer<typeof variantZodSchema>
export type ReviewsSchema = z.infer<typeof reviewZodSchema>

export type LoginSchema = z.infer<typeof loginZodSchema>
export type RegisterSchema = z.infer<typeof registerZodSchema>

export type DealSchema = z.infer<typeof dealZodSchema>
export type SettingSchema = z.infer<typeof settingsZodSchema>
export type OrderSchema = z.infer<typeof orderZodSchema>
export type AddressSchema = z.infer<typeof addressSchema>