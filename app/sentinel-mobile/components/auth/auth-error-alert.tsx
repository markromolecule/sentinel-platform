import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

export interface AuthErrorAlertProps {
    error?: string | null;
    style?: StyleProp<ViewStyle>;
}

export function AuthErrorAlert({ error, style }: AuthErrorAlertProps) {
    if (!error) return null;

    return (
        <View style={[styles.container, style]} testID="auth-error-alert">
            <Text style={styles.text}>{error}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        padding: 12,
    },
    text: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.error,
    },
});
