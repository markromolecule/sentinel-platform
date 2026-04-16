import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

interface SessionHeaderProps {
    title: string;
    subject: string;
    totalQuestions: number;
    currentIndex: number;
    timeLeft: number;
    formatTime: (seconds: number) => string;
}

export const SessionHeader = ({
    title,
    subject,
    totalQuestions,
    currentIndex,
    timeLeft,
    formatTime,
}: SessionHeaderProps) => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <View
            style={{
                paddingTop: insets.top + 10,
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
            }}
            className="z-10 px-4 pb-4 shadow-sm"
        >
            <View className="mb-2 flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                    <Text
                        style={{ color: colors.text }}
                        className="text-lg font-bold leading-tight"
                    >
                        {title}
                    </Text>
                    <Text
                        style={{ color: colors.icon }}
                        className="mt-1 text-xs font-semibold uppercase"
                    >
                        {subject} • {totalQuestions} Questions
                    </Text>
                </View>
                <View className="flex-row items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 dark:bg-gray-800">
                    <Ionicons name="time-outline" size={16} color={colors.text} />
                    <Text style={{ color: colors.text }} className="font-mono font-medium">
                        {formatTime(timeLeft)}
                    </Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View className="mt-2 h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <View
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                />
            </View>
        </View>
    );
};
