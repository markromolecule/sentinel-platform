import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { Logo } from './logo';

export type RootErrorFallbackProps = {
    error?: unknown;
    resetError?: () => void;
};

export function RootErrorFallback({ error, resetError }: RootErrorFallbackProps) {
    const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred.';

    return (
        <View style={styles.container}>
            <Logo variant="default" width={220} height={60} />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>{errorMessage}</Text>
            {resetError ? (
                <TouchableOpacity style={styles.button} onPress={resetError}>
                    <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#FFFFFF',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 24,
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    button: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});
