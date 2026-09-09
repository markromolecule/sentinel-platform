import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ThemeColors } from '@/types/exam';
import { styles } from './question-drawer.styles';

export interface DrawerLegendItem {
    key: string;
    label: string;
    icon: React.ReactNode;
    bgLight: string;
    bgDark: string;
}

/**
 * Returns configuration for the drawer status legend items (Current, Answered, Flagged).
 */
export function getDrawerLegendItems(colors: ThemeColors): DrawerLegendItem[] {
    return [
        {
            key: 'current',
            label: 'Current',
            icon: (
                <View
                    style={[
                        styles.legendDot,
                        styles.legendDotCurrent,
                        { borderColor: colors.primary },
                    ]}
                />
            ),
            bgLight: '#f9fafb',
            bgDark: 'rgba(31, 41, 55, 0.5)',
        },
        {
            key: 'answered',
            label: 'Answered',
            icon: <View style={[styles.legendDot, styles.legendDotAnswered]} />,
            bgLight: '#ecfdf5',
            bgDark: 'rgba(6, 78, 59, 0.2)',
        },
        {
            key: 'flagged',
            label: 'Flagged',
            icon: <Ionicons name="flag" size={10} color="#f59e0b" />,
            bgLight: '#fffbeb',
            bgDark: 'rgba(120, 53, 15, 0.2)',
        },
    ];
}
