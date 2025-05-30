

'use client'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import { SessionProvider } from 'next-auth/react'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        }
    }
})

export function Providers({children} : {children: React.ReactNode}) {

    return (
        <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SessionProvider>
    )
}