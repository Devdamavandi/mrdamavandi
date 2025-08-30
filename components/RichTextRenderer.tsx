
// This file is included in a ProductDetailsLoader file
// because I wanted the changes take place immediately

import { urlFor } from "@/sanity/lib/image"
import { PortableText, PortableTextComponentProps } from "next-sanity"
import Image from "next/image"


import { PortableTextBlock } from "next-sanity";

interface RichTextRendererProps {
    content: PortableTextBlock[]; // or use 'any[]' if you are unsure
    noSpaceBetweenRichImages?: boolean
}

const RichTextRenderer = ({ content, noSpaceBetweenRichImages }: RichTextRendererProps) => {

    const components = {
        types: {
            image: ({ value }: { value: { asset?: { _ref?: string }, alt?: string, caption?: string } }) => {
                if (!value?.asset?._ref) {
                    return null
                }
                return (
                    <div className={`relative w-full `}
                         style={{ margin: noSpaceBetweenRichImages ? "0" : "1rem 0" }}
                    >
                        <Image
                            src={urlFor(value.asset?._ref).url()}
                            alt={value.alt || "Product Image"}
                            width={800}
                            height={500}
                            sizes="(max-width: 768px) 100vw, 800px"
                            style={{ width: "100%", height: "auto", borderRadius: "2px" }}
                            className="rounded-lg"
                        />
                        {value.caption && (
                            <p className="text-sm text-gray-500 mt-1">{value.caption}</p>
                        )}
                    </div>
                )
            },
            spacer: ({ value }: { value?: { size?: number } }) => (
                <div style={{ height: `${value?.size || 22}px` }} />
            ),
            
        },
        block: {
            h1: ({ children }: PortableTextComponentProps<PortableTextBlock>) => <h1 className="text-4xl font-bold my-2">{children}</h1>,
            h2: ({ children }: PortableTextComponentProps<PortableTextBlock>) => <h2 className="text-3xl font-semibold my-2">{children}</h2>,
            h3: ({ children }: PortableTextComponentProps<PortableTextBlock>) => <h3 className="text-2xl font-semibold my-2">{children}</h3>,
            h4: ({ children }: PortableTextComponentProps<PortableTextBlock>) => <h4 className="text-xl font-semibold my-2">{children}</h4>,
            h5: ({ children }: PortableTextComponentProps<PortableTextBlock>) => <h5 className="text-lg font-semibold my-2">{children}</h5>,
            normal: ({ children }: PortableTextComponentProps<PortableTextBlock>) => <p className="my-2 text-gray-600" style={{ whiteSpace: "pre-line" }}>{children}</p>,
            blockquote: ({ children }: PortableTextComponentProps<PortableTextBlock>) => <blockquote className="border-l-4 pl-4 italic my-2">{children}</blockquote>,
        },
        marks: {
            strong: ({ children } : { children: React.ReactNode }) => <strong className="font-bold text-sm">{children}</strong>,
            em: ({ children } : { children: React.ReactNode }) => <em className="italic">{children}</em>,
            underline: ({ children } : { children: React.ReactNode }) => <span className="underline">{children}</span>,
            code: ({ children } : { children: React.ReactNode }) => <code className="bg-gray-100 px-1 rounded">{children}</code>,
            link: ({ children, value }: { children: React.ReactNode, value?: { href?: string } }) => (
                <a href={value?.href} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                </a>
            ),
            
        }
    }

    return <PortableText value={content} components={components} />
}

export default RichTextRenderer