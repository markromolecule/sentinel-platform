import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { Colors } from '@/constants/theme';
import { mockClassrooms } from '@/data/classrooms';

export default function ClassroomDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const classroom = mockClassrooms.find((c) => c.id === id);

    if (!classroom) {
        return (
            <View className="flex-1 items-center justify-center bg-white p-6">
                <Text className="text-lg font-bold">Classroom not found</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 rounded-xl bg-primary px-6 py-3"
                    style={{ backgroundColor: colors.primary }}
                >
                    <Text className="font-bold text-white">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={colors.primary}
            />

            {/* Compact Primary Header */}
            <View style={{ backgroundColor: colors.primary, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
                <SafeAreaView edges={['top']}>
                    <View className="px-6 py-3">
                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
                            >
                                <Ionicons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                            <View className="flex-1 px-4 items-center">
                                <Text className="text-base font-bold text-white text-center" numberOfLines={1}>
                                    {classroom.subjectTitle}
                                </Text>
                                <Text className="text-[10px] font-medium text-white/70 uppercase tracking-widest">
                                    {classroom.subjectCode} • {classroom.sectionName}
                                </Text>
                            </View>
                            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-white/10">
                                <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Main Content Area */}
                <View className="px-6 pt-8">
                    {/* Stats Grid - Premium Flat Style */}
                    <View className="mb-10 flex-row gap-4">
                        <View
                            className="flex-1 rounded-3xl p-5 border"
                            style={{ backgroundColor: colors.background, borderColor: colors.border }}
                        >
                            <Ionicons name="people" size={20} color={colors.primary} />
                            <Text className="text-2xl font-bold mt-3" style={{ color: colors.text }}>
                                {classroom.studentsCount || 0}
                            </Text>
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Students
                            </Text>
                        </View>
                        <View
                            className="flex-1 rounded-3xl p-5 border"
                            style={{ backgroundColor: colors.background, borderColor: colors.border }}
                        >
                            <Ionicons name="calendar" size={20} color="#f97316" />
                            <Text className="text-base font-bold mt-3" style={{ color: colors.text }} numberOfLines={1}>
                                {classroom.term.split(' ')[0]} {classroom.term.split(' ')[1]}
                            </Text>
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Term
                            </Text>
                        </View>
                    </View>

                    {/* Information Section */}
                    <View className="mb-10">
                        <Text className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                            General Information
                        </Text>

                        <View className="gap-6">
                            {[
                                { label: 'Instructor', value: classroom.instructorName, icon: 'person-outline' },
                            ].map((item, idx) => (
                                <View key={idx} className="flex-row items-center gap-5">
                                    <View
                                        className="h-11 w-11 items-center justify-center rounded-2xl border"
                                        style={{ borderColor: colors.border }}
                                    >
                                        <Ionicons name={item.icon as any} size={20} color={colors.icon} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                                            {item.label}
                                        </Text>
                                        <Text className="text-base font-bold" style={{ color: colors.text }}>
                                            {item.value}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Course Modules */}
                    <Text className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400">
                        Course Modules
                    </Text>
                    <View className="gap-3">
                        {[
                            { title: 'Exams & Assessments', subtitle: 'Track your progress', icon: 'document-text', color: colors.primary, bg: `${colors.primary}10` },
                            { title: 'Classmates', subtitle: 'View your peers', icon: 'people', color: '#f97316', bg: '#fff7ed' },
                        ].map((module, idx) => (
                            <TouchableOpacity
                                key={idx}
                                activeOpacity={0.7}
                                className="flex-row items-center justify-between rounded-3xl bg-white p-4 border"
                                style={{ backgroundColor: colors.background, borderColor: colors.border }}
                            >
                                <View className="flex-row items-center gap-4">
                                    <View
                                        className="h-12 w-12 items-center justify-center rounded-2xl"
                                        style={{ backgroundColor: module.bg }}
                                    >
                                        <Ionicons name={module.icon as any} size={24} color={module.color} />
                                    </View>
                                    <View>
                                        <Text className="text-base font-bold" style={{ color: colors.text }}>
                                            {module.title}
                                        </Text>
                                        <Text className="text-xs text-slate-400">{module.subtitle}</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

