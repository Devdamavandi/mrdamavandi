import { defineField, defineType } from "sanity";



export default defineType({
    name: 'productContent',
    title: 'Product Content',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'name', maxLength: 96 },
        }),
        defineField({
            name: 'richDescription',
            title: 'Rich Description',
            type: 'array',
            of: [
                { type: 'block' },
                { 
                    type: 'image',
                    options: {
                        hotspot: true,   // Enables UI for selecting focal point
                    },
                    fields: [
                        {
                            name: 'alt',
                            type: 'string',
                            title: 'Alternative text',
                            description: 'Important for SEO and accessibility'
                        },
                        {
                            name: 'caption',
                            type: 'string',
                            title: 'Caption',
                        }
                    ]
                 },
                 {
                    type: 'object',
                    name: 'spacer',
                    title: 'Spacer',
                    fields: [
                        {
                            name: 'size',
                            type: 'number',
                            title: 'Height (px)',
                            initialValue: 22  // or any defualt value
                        }
                    ] // No fields needed for a simpler spacer
                 }
            ],
        }),
        defineField({
            name: 'images',
            title: 'Product Images',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }],
        }),
        defineField({
            name: 'whatsInTheBox',
            title: "What's in the Box",
            type: 'array',
            of: [{ type: 'string' }],
        }),
        defineField({
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{ type: 'string' }],
        }),
        defineField({
            name: 'brand',
            title: 'Brand',
            type: 'string',
        }),
        defineField({
            name: 'specs',
            title: 'Specifications',
            type: 'array',
            of: [{ type: 'object', fields: [
                { name: 'label', type: 'string', title: 'Label' },
                { name: 'value', type: 'string', title: 'Value' },
            ] }]
        }),
        defineField({
            name: 'seo',
            title: 'SEO Text',
            type: 'text',
        }),
    ],
})