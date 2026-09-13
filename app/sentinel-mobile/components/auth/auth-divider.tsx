import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

export interface AuthDividerProps {
    text?: string;
    style?: StyleProp<ViewStyle>;
}

export function AuthDivider({ text = 'OR CONTINUE WITH', style }: AuthDividerProps) {
    return (
        <View style={[styles.divider, style]}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{text}</Text>
            <View style={styles.dividerLine} />
        </View>
    );
}

const styles = StyleSheet.create({
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.light.border,
    },
    dividerText: {
        marginHorizontal: 16,
        color: Colors.light.icon,
        fontSize: 12,
        fontWeight: '600',
    },
});
