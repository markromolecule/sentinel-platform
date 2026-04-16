import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';
import { ExamHistory } from '@/data/history';

interface HistoryCardProps {
    exam: ExamHistory;
    onPress: () => void;
}

export const HistoryCard = ({ exam, onPress }: HistoryCardProps) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isPassed = exam.status === 'Passed';

    return (
        <View
            style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
            }}
            className="mb-4 rounded-2xl border p-4 shadow-sm"
        >
            <View className="flex-row items-center gap-4">
                {/* Score Box */}
                <View
                    className="mr-4 h-20 w-20 items-center justify-center rounded-2xl p-4"
                    style={{
                        backgroundColor: colorScheme === 'dark' ? '#27272a' : '#f3f4f6', // Slightly darker gray for light mode
                        elevation: 2,
                    }}
                >
                    <Text style={{ color: colors.text }} className="text-xl font-bold">
                        {exam.score}
                    </Text>
                    <Text
                        style={{ color: colors.icon }}
                        className="mt-1 text-[10px] font-bold uppercase tracking-wider"
                    >
                        SCORE
                    </Text>
                </View>

                {/* Details */}
                <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-lg font-bold">
                        {exam.title}
                    </Text>

                    <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-1.5">
                            <Ionicons name="calendar-outline" size={14} color={colors.icon} />
                            <Text style={{ color: colors.icon }} className="mr-4 text-sm">
                                {exam.date}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                            <Ionicons name="time-outline" size={14} color={colors.icon} />
                            <Text style={{ color: colors.icon }} className="text-sm">
                                {exam.duration} min
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Footer / Status */}
            <View className="mt-4 flex-row items-center justify-between pl-24">
                <Text
                    className="text-sm font-bold tracking-wide"
                    style={{ color: isPassed ? '#10b981' : '#ef4444' }} // Emerald-500 or Red-500
                >
                    {isPassed ? 'PASSED' : 'FAILED'}
                </Text>

                <TouchableOpacity onPress={onPress} className="flex-row items-center gap-1">
                    <Text style={{ color: colors.icon }} className="text-sm">
                        Details
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );
};
