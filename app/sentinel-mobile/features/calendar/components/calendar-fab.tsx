import React from 'react';
import { TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface CalendarFabProps {
    onPress: () => void;
}

export const CalendarFab = ({ onPress }: CalendarFabProps) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
                position: 'absolute',
                bottom: 30,
                right: 24,
                zIndex: 50,
            }}
            onPress={onPress}
        >
            <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
    );
};

