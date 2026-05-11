import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Logo } from '@/components/logo';
import { Colors } from '@/constants/theme';
import { useAuth } from '@sentinel/hooks';

export default function SplashScreen() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                router.replace('/(tabs)/classroom');
            } else {
                router.replace('/(auth)/login');
            }
        }
    }, [user, isLoading, router]);

    return (
        <View style={styles.container}>
            <StatusBar style="light" backgroundColor="transparent" translucent />
            <View style={styles.background}>
                <Logo variant="white" width={280} height={80} />
                {isLoading && (
                    <ActivityIndicator color="white" style={{ marginTop: 20 }} size="large" />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.primary,
    },
});
