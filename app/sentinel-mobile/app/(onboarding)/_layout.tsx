import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/theme';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                gestureEnabled: false,
                contentStyle: { backgroundColor: Colors.light.background },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="terms" />
            <Stack.Screen name="privacy-policy" />
            <Stack.Screen name="setup" />
        </Stack>
    );
}
