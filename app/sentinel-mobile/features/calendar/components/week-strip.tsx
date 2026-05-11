import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

interface WeekStripProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    weekDays: Date[]; // The current week's dates to display
}

export const WeekStrip = ({
    selectedDate,
    onSelectDate,
    weekDays,
    textColor,
    selectedTextColor,
    selectedBgColor,
}: WeekStripProps & {
    textColor?: string;
    selectedTextColor?: string;
    selectedBgColor?: string;
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Defaults
    const baseTextColor = textColor || colors.icon;
    const activeBgColor = selectedBgColor || colors.primary;
    const activeTextColor = selectedTextColor || '#fff';

    // Format helpers
    const getDayName = (date: Date) =>
        date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const getDayNumber = (date: Date) => date.getDate();
    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

    return (
        <View className="flex-row justify-between px-2 py-2">
            {weekDays.map((date, index) => {
                const isSelected = isSameDay(date, selectedDate);

                return (
                    <TouchableOpacity
                        key={index}
                        onPress={() => onSelectDate(date)}
                        className="flex-1 items-center"
                    >
                        <Text
                            className="mb-1 text-[10px] font-bold tracking-widest text-white"
                            style={{
                                opacity: isSelected ? 1 : 0.6,
                            }}
                        >
                            {getDayName(date)}
                        </Text>

                        <View
                            className="h-10 w-10 items-center justify-center rounded-2xl"
                            style={{
                                backgroundColor: isSelected ? activeBgColor : 'transparent',
                            }}
                        >
                            <Text
                                className="text-base font-bold"
                                style={{
                                    color: isSelected ? activeTextColor : baseTextColor,
                                }}
                            >
                                {getDayNumber(date)}
                            </Text>
                        </View>

                        {isSelected && <View className="mt-1 h-1 w-1 rounded-full bg-white" />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
