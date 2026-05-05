import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { WeekStrip } from './week-strip';

interface CalendarHeaderProps {
    monthYear: string;
    selectedDate: Date;
    weekDays: Date[];
    onSelectDate: (date: Date) => void;
}

export const CalendarHeader = ({
    monthYear,
    selectedDate,
    weekDays,
    onSelectDate,
}: CalendarHeaderProps) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <SafeAreaView
            edges={['top']}
            style={{ backgroundColor: colors.primary }}
            className="z-10 shadow-lg"
        >
            {/* Top Bar */}
            <View className="flex-row items-center justify-between px-6 pb-6 pt-4">

                <View>
                    <Text className="text-4xl font-bold tracking-tight text-white">
                        {monthYear}
                    </Text>
                </View>


                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        className="h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                        <Ionicons name="search" size={20} color="#fff" />
                    </TouchableOpacity>


                    <TouchableOpacity
                        className="h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    >
                        <Ionicons name="notifications-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Week Strip */}
            <WeekStrip
                selectedDate={selectedDate}
                weekDays={weekDays}
                onSelectDate={onSelectDate}
                textColor="rgba(255,255,255,0.7)"
                selectedTextColor={colors.primary}
                selectedBgColor="#fff"
            />

            <View className="h-[1px] w-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
        </SafeAreaView>
    );
};


