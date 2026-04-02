'use client'

import { ApiProvider, AuthProvider, useApiHealth, useHeartbeat, usePresence } from "@sentinel/hooks";
import { apiClient } from "@/data/api/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { ThemeProvider } from "@/components/providers"
import { Toaster } from "@sentinel/ui"
import { createSupabaseClient } from "@/data/supabase/client";

export default function Providers({ children }: { children: ReactNode }) {
    const supabase = createSupabaseClient();
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider supabase={supabase}>
                <ApiProvider apiClient={apiClient}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <ClientRuntimeServices />
                        {children}
                        <Toaster />
                    </ThemeProvider>
                </ApiProvider>
            </AuthProvider>
        </QueryClientProvider>
    )
}

function ClientRuntimeServices() {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return null;
    }

    return (
        <>
            <PresenceManager />
            <ApiHealthCheck />
        </>
    );
}

function PresenceManager() {
    useHeartbeat();
    usePresence();
    return null;
}

function ApiHealthCheck() {
    const { data, isError } = useApiHealth()

    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        if (data) {
            console.log('API Health Check: Connected/Healthy');
        }
        if (isError) {
            console.error('API Health Check: Failed to connect to API');
        }
    }

    return null
}
