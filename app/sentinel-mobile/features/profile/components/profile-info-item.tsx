import React from 'react';
import { View, Text, useColorScheme, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '@/constants/theme';

interface ProfileInfoItemProps {
    icon: string;
    label: string;
    value: string;
    isLast?: boolean;
    onPress?: () => void;
}

export const ProfileInfoItem = ({
    icon,
    label,
    value,
    isLast = false,
    onPress,
}: ProfileInfoItemProps) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
    const iconBg = isDark ? 'rgba(50,61,143,0.15)' : '#F0F4FF';
    const primaryColor = '#323d8f';

    const Content = (
        <View
            style={[
                styles.row,
                !isLast && { borderBottomWidth: 1, borderBottomColor: dividerColor },
            ]}
        >
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Ionicons name={icon as any} size={20} color={primaryColor} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.label, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                    {label}
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
            </View>
            {onPress && (
                <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
                />
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
                {Content}
            </TouchableOpacity>
        );
    }

    return Content;
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    label: {
        fontSize: Typography.size.xs,
        fontWeight: Typography.weight.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    value: {
        fontSize: Typography.size.base,
        fontWeight: Typography.weight.semibold,
        letterSpacing: -0.1,
    },
});
