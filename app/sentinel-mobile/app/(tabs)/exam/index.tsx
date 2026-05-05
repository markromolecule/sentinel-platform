import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    StatusBar,
    Image,
    RefreshControl,
    ActivityIndicator,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import { Colors } from '@/constants/theme';
import { useExamsQuery } from '@sentinel/hooks';
import ExamCard from '@/components/exam/exam-card';

export default function ExamScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [activeTab, setActiveTab] = useState<'available' | 'past_due' | 'turned_in'>('available');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const { data: exams = [], isLoading, isError, refetch } = useExamsQuery();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const mappedExams = (exams || []).map(exam => ({
        ...exam,
        duration: exam.duration,
        subject: exam.subject || 'General',
        professor: 'Instructor',
        section: exam.section || exam.sectionNames?.[0] || undefined,
        room: exam.room || undefined,
    })) as any[];

    const filteredExams = mappedExams.filter((exam) => {
        const matchesSearch =
            exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exam.subject.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesTab =
            activeTab === 'available'
                ? exam.status === 'available' || exam.status === 'upcoming'
                : activeTab === 'past_due'
                    ? exam.status === 'past_due'
                    : exam.status === 'turned_in' || exam.status === 'completed';

        return matchesSearch && matchesTab;
    });

    const handleExamPress = (examId: string) => {
        const exam = mappedExams.find((e) => e.id === examId);
        if (!exam) return;

        if (exam.status === 'completed' || exam.status === 'turned_in') {
            router.push(`/exam/${examId}/result` as any);
        } else {
            router.push(`/exam/${examId}/instruction` as any);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Header */}
            <View
                className="pb-8"
                style={{
                    backgroundColor: colors.primary,
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                    zIndex: 10,
                }}
            >
                <SafeAreaView edges={['top']}>
                    <View className="px-6 pt-4 pb-6">
                        <Text className="text-2xl font-bold text-white">Examinations</Text>
                        <Text className="text-sm text-white/70">Track your assessments</Text>
                    </View>
                </SafeAreaView>

                {/* Floating Search Bar */}
                <View className="px-6 relative">
                    <Image
                        source={require('@/assets/images/sentinel-character.png')}
                        style={{
                            width: 60,
                            height: 60,
                            position: 'absolute',
                            top: -45,
                            right: 40,
                            zIndex: -1,
                        }}
                    />
                    <View
                        className="flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-lg"
                        style={{ elevation: 5 }}
                    >
                        <Ionicons name="search" size={20} color={colors.icon} />
                        <TextInput
                            placeholder="Search assessments..."
                            placeholderTextColor={colors.icon}
                            className="ml-3 flex-1 text-base"
                            style={{ color: colors.text }}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            </View>

            {/* Filter Chips */}
            <View className="px-6 pt-6 pb-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    <Pressable
                        onPress={() => setActiveTab('available')}
                        className={`mr-3 rounded-full px-5 py-2.5 ${activeTab === 'available' ? 'bg-primary' : 'bg-slate-100'
                            }`}
                        style={activeTab === 'available' ? { backgroundColor: colors.primary } : {}}
                    >
                        <Text className={`text-xs font-bold ${activeTab === 'available' ? 'text-white' : 'text-slate-500'}`}>
                            Available
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('past_due')}
                        className={`mr-3 rounded-full px-5 py-2.5 ${activeTab === 'past_due' ? 'bg-red-500' : 'bg-slate-100'
                            }`}
                        style={activeTab === 'past_due' ? { backgroundColor: '#EF4444' } : {}}
                    >
                        <Text className={`text-xs font-bold ${activeTab === 'past_due' ? 'text-white' : 'text-slate-500'}`}>
                            Past Due
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('turned_in')}
                        className={`mr-3 rounded-full px-5 py-2.5 ${activeTab === 'turned_in' ? 'bg-green-500' : 'bg-slate-100'
                            }`}
                        style={activeTab === 'turned_in' ? { backgroundColor: '#22C55E' } : {}}
                    >
                        <Text className={`text-xs font-bold ${activeTab === 'turned_in' ? 'text-white' : 'text-slate-500'}`}>
                            Turned In
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>

            <View className="mt-4 flex-1 px-6">
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
                    <View className="mb-4 flex-row items-center justify-between">
                        <Text className="text-xl font-bold" style={{ color: colors.text }}>
                            {activeTab === 'available' ? 'Your Schedule' : activeTab === 'past_due' ? 'Overdue' : 'Completed'}
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                            {filteredExams.length} Total
                        </Text>
                    </View>

                    {isLoading && !refreshing ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text className="mt-4 text-sm font-medium" style={{ color: colors.icon }}>
                                Syncing assessments...
                            </Text>
                        </View>
                    ) : isError ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
                            <Text className="mt-4 text-lg font-bold" style={{ color: colors.text }}>
                                Connection Error
                            </Text>
                            <TouchableOpacity
                                onPress={() => refetch()}
                                className="mt-6 rounded-xl px-6 py-2"
                                style={{ backgroundColor: colors.primary }}
                            >
                                <Text className="font-bold text-white">Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : filteredExams.length > 0 ? (
                        filteredExams.map((exam) => (
                            <ExamCard
                                key={exam.id}
                                exam={exam}
                                onPress={() => handleExamPress(exam.id)}
                            />
                        ))
                    ) : (
                        <View className="items-center justify-center py-20">
                            <View
                                className="mb-4 h-24 w-24 items-center justify-center rounded-full"
                                style={{ backgroundColor: `${colors.icon}10` }}
                            >
                                <Ionicons name="document-text" size={48} color={colors.icon} />
                            </View>
                            <Text className="text-lg font-bold" style={{ color: colors.text }}>
                                No exams found
                            </Text>
                            <Text className="mt-1 text-center text-sm" style={{ color: colors.icon }}>
                                {searchQuery
                                    ? `Nothing matching "${searchQuery}"`
                                    : "No assessments in this category."}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}
