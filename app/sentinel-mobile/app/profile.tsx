import React from 'react';
import { Stack } from 'expo-router';
import { ProfileScreen } from '@/features/profile';

export default function ProfileRoute() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ProfileScreen />
        </>
    );
}
