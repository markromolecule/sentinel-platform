import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export interface Message {
    id: string;
    senderIndex: number;
    name: string;
    avatar?: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
    isOnline?: boolean;
}

interface MessageItemProps {
    message: Message;
    onPress: (id: string) => void;
}

export const MessageItem = ({ message, onPress }: MessageItemProps) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    // Generate initials
    const initials = message.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    // Muted pastel colors for avatars (modern look)
    const avatarColors = [
        '#3b82f6', // blue
        '#ef4444', // red
        '#10b981', // green
        '#f59e0b', // amber
        '#8b5cf6', // violet
        '#ec4899', // pink
    ];

    const avatarBg = avatarColors[message.senderIndex % avatarColors.length];

    return (
        <TouchableOpacity
            onPress={() => onPress(message.id)}
            activeOpacity={0.7}
            className="flex-row items-center px-4 py-3"
            style={{ backgroundColor: colors.background }}
        >
            {/* Avatar Section */}
            <View className="relative mr-4">
                <View
                    className="items-center justify-center shadow-sm"
                    style={{
                        backgroundColor: avatarBg,
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                    }}
                >
                    <Text className="text-lg font-semibold text-white">{initials}</Text>
                </View>

                {/* Online Indicator with border matching background */}
                {message.isOnline && (
                    <View
                        className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-[3px]"
                        style={{
                            backgroundColor: '#22c55e', // Green-500
                            borderColor: colors.background,
                        }}
                    />
                )}
            </View>

            {/* Text Content */}
            <View className="min-h-[50px] flex-1 justify-center">
                {/* Top Row: Name and Time */}
                <View className="mb-1 flex-row items-baseline justify-between">
                    <Text
                        className="mr-2 flex-1 text-base font-bold"
                        style={{ color: colors.text }}
                        numberOfLines={1}
                    >
                        {message.name}
                    </Text>
                    <Text
                        className="text-xs font-medium"
                        style={{
                            color: message.unreadCount > 0 ? colors.tint : colors.icon,
                            opacity: message.unreadCount > 0 ? 1 : 0.7,
                        }}
                    >
                        {message.time}
                    </Text>
                </View>

                {/* Bottom Row: Message and Badge */}
                <View className="flex-row items-start justify-between">
                    <Text
                        className="mr-4 flex-1 text-sm leading-5"
                        style={{
                            color: message.unreadCount > 0 ? colors.text : colors.icon,
                            fontWeight: message.unreadCount > 0 ? '600' : '400',
                        }}
                        numberOfLines={2}
                    >
                        {message.lastMessage}
                    </Text>

                    {message.unreadCount > 0 && (
                        <View
                            className="mt-0.5 items-center justify-center"
                            style={{
                                backgroundColor: colors.tint,
                                minWidth: 20,
                                height: 20,
                                borderRadius: 10,
                                paddingHorizontal: 6,
                            }}
                        >
                            <Text className="text-[11px] font-bold text-white">
                                {message.unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};
