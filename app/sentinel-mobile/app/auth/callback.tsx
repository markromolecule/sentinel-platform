import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Colors } from '@/constants/theme';
import { setSessionFromOAuthCallback } from '@/lib/auth/oauth-callback';

export default function AuthCallbackScreen() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const completeCallback = async () => {
            try {
                const callbackUrl = Linking.getLinkingURL();

                if (!callbackUrl) {
                    throw new Error('Missing authentication callback URL.');
                }

                const result = await setSessionFromOAuthCallback(callbackUrl);

                if (result.status !== 'success') {
                    throw new Error('Authentication callback did not include a session.');
                }

                router.replace('/(tabs)/classroom');
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Google login failed. Please try again.';

                if (isMounted) {
                    setErrorMessage(message);
                }

                router.replace({
                    pathname: '/(auth)/login',
                    params: { error: message },
                });
            }
        };

        completeCallback();

        return () => {
            isMounted = false;
        };
    }, [router]);

    return (
        <View className="flex-1 items-center justify-center bg-white px-6">
            <Stack.Screen options={{ headerShown: false }} />
            <ActivityIndicator color={Colors.light.primary} size="large" />
            {errorMessage ? (
                <Text className="mt-4 text-center text-sm font-medium text-red-600">
                    {errorMessage}
                </Text>
            ) : null}
        </View>
    );
}
