import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    StatusBar,
    Animated,
    Image,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useRef, useCallback } from 'react';
import { Colors } from '@/constants/theme';
import { mockExams } from '@/data/exams';
import ExamCard from '@/components/exam/exam-card';

export default function ExamScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [activeTab, setActiveTab] = useState<'available' | 'past_due' | 'turned_in'>('available');
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const filteredExams = mockExams.filter((exam) => {
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
        router.push(`/exam-details/${examId}/details` as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Grab-style Header with Character Effect */}
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
                    <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
                        <View className="flex-1 pr-4">
                            <Text className="text-2xl font-bold text-white">Examinations</Text>
                            <Text className="text-sm text-white/70">Track your assessments</Text>
                        </View>
                    </View>
                </SafeAreaView>

                {/* Floating Search Bar with Emerging Character */}
                <View className="px-6 relative">
                    {/* Stationary Character Peeking Out */}
                    <Image
                        source={require('@/assets/images/sentinel-character.png')}
                        style={{
                            width: 100,
                            height: 100,
                            position: 'absolute',
                            right: 15,
                            top: -70,
                            zIndex: 5,
                        }}
                        resizeMode="contain"
                    />

                    <View
                        className="flex-row items-center h-12 rounded-2xl bg-white px-4 shadow-xl"
                        style={{
                            elevation: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 12,
                            zIndex: 10,
                        }}
                    >
                        <Ionicons name="search" size={20} color={colors.icon} />
                        <TextInput
                            className="ml-3 flex-1 text-base font-medium"
                            placeholder="Find exams..."
                            placeholderTextColor={colors.icon}
                            style={{
                                color: colors.text,
                                height: 48,
                                paddingTop: 0,
                                paddingBottom: 0,
                            }}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            </View>

            {/* Modern Tab Toggle (Pill Style) */}
            <View className="mt-6 px-6">
                <View className="flex-row rounded-2xl bg-slate-100 p-1.5">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setActiveTab('available')}
                        className={`flex-1 flex-row items-center justify-center rounded-xl py-2.5 ${activeTab === 'available' ? 'bg-white shadow-sm' : ''
                            }`}
                    >
                        <Ionicons
                            name="flash"
                            size={16}
                            color={activeTab === 'available' ? colors.primary : colors.icon}
                        />
                        <Text
                            className={`ml-1.5 text-xs ${activeTab === 'available' ? 'font-bold' : 'font-medium'}`}
                            style={{ color: activeTab === 'available' ? colors.primary : colors.icon }}
                        >
                            Available
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setActiveTab('past_due')}
                        className={`flex-1 flex-row items-center justify-center rounded-xl py-2.5 ${activeTab === 'past_due' ? 'bg-white shadow-sm' : ''
                            }`}
                    >
                        <Ionicons
                            name="alert-circle"
                            size={16}
                            color={activeTab === 'past_due' ? '#EF4444' : colors.icon}
                        />
                        <Text
                            className={`ml-1.5 text-xs ${activeTab === 'past_due' ? 'font-bold' : 'font-medium'}`}
                            style={{ color: activeTab === 'past_due' ? '#EF4444' : colors.icon }}
                        >
                            Past Due
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setActiveTab('turned_in')}
                        className={`flex-1 flex-row items-center justify-center rounded-xl py-2.5 ${activeTab === 'turned_in' ? 'bg-white shadow-sm' : ''
                            }`}
                    >
                        <Ionicons
                            name="checkmark-done"
                            size={16}
                            color={activeTab === 'turned_in' ? '#22C55E' : colors.icon}
                        />
                        <Text
                            className={`ml-1.5 text-xs ${activeTab === 'turned_in' ? 'font-bold' : 'font-medium'}`}
                            style={{ color: activeTab === 'turned_in' ? '#22C55E' : colors.icon }}
                        >
                            Turned In
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="mt-6 flex-1 px-6">
                {/* Exam List */}
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
                            {activeTab === 'available' ? 'Your Schedule' : activeTab === 'past_due' ? 'Overdue Assessments' : 'Completed Exams'}
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                            {filteredExams.length} Total
                        </Text>
                    </View>

                    {filteredExams.length > 0 ? (
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
                                    ? `We couldn't find anything matching "${searchQuery}"`
                                    : "You don't have any exams here yet."}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}
