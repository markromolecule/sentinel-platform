import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type ExamNotFoundProps } from '@/types/exam';

export function ExamNotFound({ colors, onGoBack }: ExamNotFoundProps) {
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View className="flex-1 items-center justify-center px-6">
                <Ionicons name="warning-outline" size={64} color={colors.icon} />
                <Text className="mt-4 text-lg font-medium" style={{ color: colors.text }}>
                    Exam not found
                </Text>
                <TouchableOpacity
                    className="mt-6 rounded-2xl px-8 py-3.5"
                    style={{ backgroundColor: colors.primary }}
                    onPress={onGoBack}
                >
                    <Text className="text-base font-semibold text-white">Go Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
