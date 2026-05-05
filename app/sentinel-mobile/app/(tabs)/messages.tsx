import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    StatusBar,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { MessageItem, Message } from '@/features/messages';

// Mock Data
const MOCK_MESSAGES: Message[] = [
    {
        id: '1',
        senderIndex: 0,
        name: 'Dr. Sarah Wilson',
        lastMessage: 'Your test results are ready for review.',
        time: '10:30 AM',
        unreadCount: 2,
        isOnline: true,
    },
    {
        id: '2',
        senderIndex: 1,
        name: 'Clinic Support',
        lastMessage: 'Please confirm your appointment for tomorrow.',
        time: 'Yesterday',
        unreadCount: 0,
    },
    {
        id: '3',
        senderIndex: 2,
        name: 'Pharmacy',
        lastMessage: 'Your prescription is ready for pickup at the main branch.',
        time: 'Tue',
        unreadCount: 1,
    },
    {
        id: '4',
        senderIndex: 3,
        name: 'Dr. James Chen',
        lastMessage: "Thanks for the update. Let's schedule a follow-up next week.",
        time: 'Mon',
        unreadCount: 0,
        isOnline: true,
    },
    {
        id: '5',
        senderIndex: 4,
        name: 'Lab Services',
        lastMessage: 'Blood work appointment confirmed for 9:00 AM.',
        time: 'Last week',
        unreadCount: 0,
    },
    {
        id: '6',
        senderIndex: 5,
        name: 'Emergency Contact',
        lastMessage: 'Call me when you are free.',
        time: '2 weeks ago',
        unreadCount: 0,
    },
];

export default function MessagesRoute() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');

    // Use useMemo for filtering to avoid unnecessary state updates and potential mount issues
    const filteredMessages = useMemo(() => {
        if (!searchQuery.trim()) return MOCK_MESSAGES;
        const query = searchQuery.toLowerCase();
        return MOCK_MESSAGES.filter(
            (msg) =>
                msg.name.toLowerCase().includes(query) ||
                msg.lastMessage.toLowerCase().includes(query),
        );
    }, [searchQuery]);

    const handleClearSearch = () => {
        setSearchQuery('');
        Keyboard.dismiss();
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Header Section (Immersive Style matching Classroom) */}
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
                            <Text className="text-sm font-medium text-white/70">Connect,</Text>
                            <Text className="text-2xl font-bold text-white">Recent Messages</Text>
                        </View>
                        {/* New Message / Action Button */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
                        >
                            <Ionicons name="create-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                <View className="px-6">
                    {/* Sleeker Search Bar integrated into Header */}
                    <View
                        className="flex-row items-center h-12 rounded-2xl bg-white px-4 shadow-xl"
                    >
                        <Ionicons name="search" size={20} color={colors.icon} />
                        <TextInput
                            className="ml-3 flex-1 text-base"
                            placeholder="Search messages..."
                            placeholderTextColor={colors.icon}
                            style={{
                                color: '#11181C',
                                height: 48,
                            }}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={handleClearSearch}>
                                <Ionicons name="close-circle" size={18} color={colors.icon} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Content Section */}
            <View className="flex-1">
                <View className="px-6 pt-6 pb-2">
                    <Text className="text-xl font-bold" style={{ color: colors.text }}>
                        All Conversations
                    </Text>
                    <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                        {filteredMessages.length} Active Conversations
                    </Text>
                </View>

                {/* Messages List */}
                <FlatList
                    data={filteredMessages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <MessageItem message={item} onPress={(id) => console.log(id)} />
                    )}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
                    ItemSeparatorComponent={() => (
                        <View
                            className="ml-[80px] mr-6 h-[0.5px]"
                            style={{ backgroundColor: isDark ? '#27272a' : '#f1f1f1' }}
                        />
                    )}
                    ListEmptyComponent={() => (
                        <View className="flex-1 items-center justify-center px-10 pt-20 opacity-60">
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={64}
                                color={colors.icon}
                            />
                            <Text
                                className="mt-4 text-center text-lg font-semibold"
                                style={{ color: colors.text }}
                            >
                                No messages found
                            </Text>
                        </View>
                    )}
                />
            </View>

            {/* Floating Action Button (Consistent with recent modernization) */}
            <TouchableOpacity
                className="absolute bottom-10 right-6 h-14 w-14 items-center justify-center rounded-2xl shadow-xl"
                style={{
                    backgroundColor: colors.tint,
                    shadowColor: colors.tint,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 8,
                }}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}
