import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface TodayButtonProps {
    visible: boolean;
    onPress: () => void;
}

export const TodayButton = ({ visible, onPress }: TodayButtonProps) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    if (!visible) return null;

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 50,
                left: 0,
                right: 0,
                alignItems: 'center',
                zIndex: 50,
            }}
            pointerEvents="box-none"
        >
            <TouchableOpacity
                className="flex-row items-center rounded-full px-6 py-3"
                style={{
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 10 },
                }}
                onPress={onPress}
            >
                <Ionicons name="calendar-sharp" size={14} color="#fff" />
                <Text
                    className="ml-3 text-[10px] font-black uppercase tracking-[2px]"
                    style={{ color: '#fff' }}
                >
                    BACK TO TODAY
                </Text>
            </TouchableOpacity>
        </View>
    );
};
