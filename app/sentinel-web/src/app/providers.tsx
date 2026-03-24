'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@sentinel/ui"
import { useApiHealth } from '@/hooks/query/api/use-api-health'
import { useHeartbeat } from '@/hooks/use-heartbeat'
import { usePresence } from '@/hooks/use-presence'
import { AuthProvider } from "@sentinel/hooks";
import { createSupabaseClient } from "@/data/supabase/client";

export default function Providers({ children }: { children: ReactNode }) {
    const supabase = createSupabaseClient();
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // to avoid refetching
                    },
                },
            }
            )
    )

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider supabase={supabase}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <PresenceManager />
                    <ApiHealthCheck />
                    {children}
                    <Toaster />
                </ThemeProvider>
            </AuthProvider>
        </QueryClientProvider>
    )
}

function PresenceManager() {
    useHeartbeat();
    usePresence();
    return null;
}



function ApiHealthCheck() {
    const { data, isError } = useApiHealth()

    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        if (data)
            console.log('API Health Check: Connected to', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')
        if (isError)
            console.error('API Health Check: Failed to connect to', process.env.NEXT_PUBLIC_API_URL)
    }

    return null
}
