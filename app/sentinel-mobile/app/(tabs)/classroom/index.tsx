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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { Colors } from '@/constants/theme';
import { mockClassrooms } from '@/data/classrooms';
import ClassroomCard from '@/components/classroom/classroom-card';

export default function ClassroomScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const filteredClassrooms = mockClassrooms.filter((classroom) => {
        return (
            classroom.subjectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            classroom.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const handleClassroomPress = (id: string) => {
        router.push(`/classroom/${id}` as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Header Section */}
            <View
                className="pb-8"
                style={{
                    backgroundColor: colors.primary,
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                }}
            >
                <SafeAreaView edges={['top']}>
                    <View className="px-6 flex-row items-center justify-between pt-4 pb-6">
                        <View>
                            <Text className="text-sm font-medium text-white/70">Welcome,</Text>
                            <Text className="text-2xl font-bold text-white">Juan Dela Cruz</Text>
                        </View>
                        {/* Circular Profile Button */}
                        <TouchableOpacity
                            onPress={() => router.push('/profile' as any)}
                            activeOpacity={0.7}
                            className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
                        >
                            <Ionicons name="person" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                <View className="px-6">
                    {/* Sleeker Search Bar */}
                    <View
                        className="flex-row items-center h-12 rounded-2xl bg-white px-4 shadow-xl"
                    >
                        <Ionicons name="search" size={20} color={colors.icon} />
                        <TextInput
                            className="ml-3 flex-1 text-base"
                            placeholder="Search subjects..."
                            placeholderTextColor={colors.icon}
                            style={{
                                color: colors.text,
                                height: 48,
                            }}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            </View>

            {/* Content Section */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                <View className="mb-6 flex-row items-center justify-between">
                    <View>
                        <Text className="text-xl font-bold" style={{ color: colors.text }}>
                            My Classrooms
                        </Text>
                        <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                            {mockClassrooms.length} Subjects Enrolled
                        </Text>
                    </View>
                    <TouchableOpacity>
                        <Text className="text-sm font-bold" style={{ color: colors.primary }}>
                            View All
                        </Text>
                    </TouchableOpacity>
                </View>

                {filteredClassrooms.length > 0 ? (
                    filteredClassrooms.map((classroom) => (
                        <ClassroomCard
                            key={classroom.id}
                            classroom={classroom}
                            onPress={() => handleClassroomPress(classroom.id)}
                        />
                    ))
                ) : (
                    <View className="items-center justify-center py-20">
                        <Ionicons name="school-outline" size={64} color={colors.icon} />
                        <Text className="mt-4 text-lg font-bold" style={{ color: colors.text }}>
                            No Classrooms Found
                        </Text>
                        <Text className="text-sm" style={{ color: colors.icon }}>
                            Try searching for another subject.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
