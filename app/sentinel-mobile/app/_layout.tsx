import '../global.css';
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, ApiProvider } from '@sentinel/hooks';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';

export default function RootLayout() {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                    },
                },
            }),
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider supabase={supabase}>
                        <ApiProvider apiClient={apiClient}>
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="index" />
                                <Stack.Screen name="auth/callback" />
                                <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
                                <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
                                <Stack.Screen
                                    name="exam/[id]"
                                    options={{
                                        animation: 'slide_from_right',
                                        gestureEnabled: false,
                                        fullScreenGestureEnabled: false,
                                    }}
                                />
                            </Stack>
                        </ApiProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
