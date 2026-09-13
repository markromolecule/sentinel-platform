import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/theme';

export interface AuthFooterProps {
    text: string;
    linkText: string;
    href: string;
    style?: StyleProp<ViewStyle>;
}

export function AuthFooter({ text, linkText, href, style }: AuthFooterProps) {
    return (
        <View style={[styles.footer, style]}>
            <Text style={styles.footerText}>{text}</Text>
            <Link href={href as any} style={styles.link}>
                {linkText}
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    footerText: {
        color: Colors.light.icon,
        fontSize: 14,
    },
    link: {
        color: Colors.light.primary,
        fontWeight: '600',
        fontSize: 14,
    },
});
