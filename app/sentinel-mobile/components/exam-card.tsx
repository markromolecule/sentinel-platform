import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { Exam } from '../data/exams';

interface ExamCardProps {
    exam: Exam;
    onPress?: () => void;
}

export default function ExamCard({ exam, onPress }: ExamCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const getStatusColor = (status: Exam['status']) => {
        switch (status) {
            case 'available':
                return '#18181b';
            case 'upcoming':
                return '#f59e0b';
            case 'completed':
                return '#10b981';
        }
    };

    const getStatusLabel = (status: Exam['status']) => {
        switch (status) {
            case 'available':
                return 'Available';
            case 'upcoming':
                return 'Upcoming';
            case 'completed':
                return 'Completed';
        }
    };

    return (
        <View className="mb-4 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: colors.card }}>
            {/* Status Badge */}
            <View className="absolute right-4 top-4 z-10">
                <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: getStatusColor(exam.status) }}
                >
                    <Text className="text-xs font-medium text-white">
                        {getStatusLabel(exam.status)}
                    </Text>
                </View>
            </View>

            {/* Exam Title */}
            <Text
                className="mb-1 text-lg font-bold"
                style={{ color: colors.text }}
                numberOfLines={2}
            >
                {exam.title}
            </Text>

            {/* Subject */}
            <Text className="mb-3 text-sm" style={{ color: colors.icon }}>
                {exam.subject}
            </Text>

            {/* Duration & Professor */}
            <View className="mb-3 flex-row items-center">
                <View className="mr-4 flex-row items-center">
                    <Ionicons name="time-outline" size={16} color={colors.icon} />
                    <Text className="ml-1 text-sm" style={{ color: colors.icon }}>
                        {exam.duration} minutes
                    </Text>
                </View>
                <View className="flex-1 flex-row items-center">
                    <Ionicons name="person-outline" size={16} color={colors.icon} />
                    <Text
                        className="ml-1 flex-1 text-sm"
                        style={{ color: colors.icon }}
                        numberOfLines={1}
                    >
                        {exam.professor}
                    </Text>
                </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
                className="rounded-lg border py-3"
                style={{
                    borderColor: colors.border,
                    backgroundColor: exam.status === 'available' ? colors.primary : 'transparent',
                }}
                onPress={onPress}
                disabled={exam.status !== 'available'}
            >
                <Text
                    className="text-center text-sm font-semibold"
                    style={{
                        color: exam.status === 'available' ? '#fff' : colors.icon,
                    }}
                >
                    {exam.status === 'available' ? 'View Details' : 'Coming Soon'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
