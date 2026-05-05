import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { CalendarEvent } from '@/data/calendar';

import { Swipeable } from 'react-native-gesture-handler';

interface EventCardProps {
    event: CalendarEvent;
    onDelete?: (id: string) => void;
}

export const EventCard = ({ event, onDelete }: EventCardProps) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isExam = event.type === 'exam';
    const isDark = colorScheme === 'dark';

    const renderRightActions = (progress: any, dragX: any) => {
        if (isExam || !onDelete) return null;

        return (
            <View
                className="mb-3 ml-2 overflow-hidden rounded-2xl"
                style={{ width: 70, backgroundColor: '#ff3b30' }}
            >
                <View className="flex-1 items-center justify-center">
                    <Ionicons name="trash" size={22} color="white" />
                </View>
            </View>
        );
    };

    const cardContent = (
        <View
            className="mb-3 overflow-hidden rounded-2xl"
            style={{
                backgroundColor: colors.card,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.2 : 0.04,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <View className="flex-row items-center p-4">
                {/* Minimal Indicator */}
                <View 
                    className="mr-4 h-10 w-1 rounded-full" 
                    style={{ 
                        backgroundColor: isExam ? '#f59e0b' : colors.primary,
                        opacity: 0.9 
                    }} 
                />

                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-base font-bold tracking-tight" style={{ color: colors.text }}>
                            {isExam ? event.title : event.description}
                        </Text>
                        
                        {isExam && (
                            <View
                                className="rounded-md px-1.5 py-0.5"
                                style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }}
                            >
                                <Text className="text-[8px] font-black uppercase text-[#d97706]">EXAM</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="time-outline" size={12} color={colors.icon} style={{ opacity: 0.4 }} />
                            <Text className="text-xs font-medium" style={{ color: colors.icon, opacity: 0.6 }}>
                                {event.time}
                            </Text>
                        </View>
                        
                        {isExam && event.description && (
                            <Text className="text-xs font-medium" style={{ color: colors.icon, opacity: 0.4 }}>
                                • {event.description.split(' • ')[0]}
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );

    if (isExam || !onDelete) {
        return cardContent;
    }

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            friction={2}
            rightThreshold={80}
            onSwipeableOpen={(direction) => {
                if (direction === 'right') {
                    onDelete(event.id);
                }
            }}
            containerStyle={{ overflow: 'visible' }}
        >
            {cardContent}
        </Swipeable>
    );
};
