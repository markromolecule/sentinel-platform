import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { Classroom } from '../../data/classrooms';

interface ClassroomCardProps {
    classroom: Classroom;
    onPress?: () => void;
}

export default function ClassroomCard({ classroom, onPress }: ClassroomCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            className="mb-4 overflow-hidden rounded-2xl border bg-white shadow-sm"
            style={{ borderColor: colors.border }}
        >
            <View className="p-4">
                <View className="mb-3 flex-row items-start justify-between">
                    <View
                        className="h-10 w-10 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${colors.primary}15` }}
                    >
                        <Ionicons name="book" size={20} color={colors.primary} />
                    </View>
                    <View className="rounded-full bg-slate-100 px-2.5 py-1">
                        <Text className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                            {classroom.subjectCode}
                        </Text>
                    </View>
                </View>

                <View className="mb-3">
                    <Text
                        className="text-base font-bold leading-tight"
                        style={{ color: colors.text }}
                        numberOfLines={1}
                    >
                        {classroom.subjectTitle}
                    </Text>
                    <Text className="mt-1 text-xs font-medium" style={{ color: colors.icon }}>
                        Section {classroom.sectionName}
                    </Text>
                </View>

                <View className="h-[1px] w-full bg-slate-100" />

                <View className="mt-3 gap-1.5">
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="school-outline" size={14} color={colors.icon} />
                        <Text className="text-xs font-medium" style={{ color: colors.icon }}>
                            {classroom.instructorName}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="calendar-outline" size={14} color={colors.icon} />
                        <Text className="text-xs font-medium" style={{ color: colors.icon }}>
                            {classroom.term}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
