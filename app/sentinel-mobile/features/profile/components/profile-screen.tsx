import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    useColorScheme,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { ProfileInfoItem } from './profile-info-item';
import { PasswordInput } from './password-input';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    const handleUpdatePassword = () => {
        if (passwords.new !== passwords.confirm) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }

        setIsLoading(true);
        // Simulate API Call
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Success', 'Password updated successfully!');
            setPasswords({ current: '', new: '', confirm: '' });
        }, 1500);
    };

    const sentinelBlue = '#323d8f'; // Defining consistent brand color for header

    return (
        <View style={{ flex: 1, backgroundColor: sentinelBlue }}>
            <StatusBar barStyle="light-content" backgroundColor={sentinelBlue} />

            <SafeAreaView edges={['top']} style={{ backgroundColor: sentinelBlue }}>
                <View className="flex-row items-center justify-between px-6 py-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="-ml-2 h-10 w-10 items-center justify-center rounded-full active:bg-white/10"
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-white">Profile</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View className="items-center pb-10 pt-4">
                    <View className="relative mb-4">
                        <View
                            className="h-28 w-28 items-center justify-center rounded-full bg-white shadow-lg"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8,
                            }}
                        >
                            <Text className="text-4xl font-bold" style={{ color: sentinelBlue }}>
                                JD
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-[3px]"
                            style={{ backgroundColor: colors.card, borderColor: sentinelBlue }}
                        >
                            <Ionicons name="camera" size={16} color={sentinelBlue} />
                        </TouchableOpacity>
                    </View>
                    <Text className="mb-1 text-2xl font-bold text-white">Juan Dela Cruz</Text>
                    <Text className="text-base font-medium text-white/80">
                        juan.delacruz@student.edu
                    </Text>
                </View>
            </SafeAreaView>

            <View
                style={{ flex: 1, backgroundColor: colors.background }}
                className="overflow-hidden rounded-t-[32px]"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 40, paddingTop: 32 }}
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="px-6">
                            <Text
                                className="mb-3 ml-1 text-xs font-bold uppercase tracking-widest opacity-60"
                                style={{ color: colors.text }}
                            >
                                Student Details
                            </Text>
                            <View
                                className="mb-8 overflow-hidden rounded-2xl border shadow-sm"
                                style={{
                                    backgroundColor: colors.card,
                                    borderColor: isDark ? colors.border : 'rgba(0,0,0,0.05)',
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 1,
                                    },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}
                            >
                                <View className="px-5 py-2">
                                    <ProfileInfoItem
                                        icon="person-outline"
                                        label="First Name"
                                        value="Juan"
                                    />
                                    <ProfileInfoItem
                                        icon="person-outline"
                                        label="Last Name"
                                        value="Dela Cruz"
                                    />
                                    <ProfileInfoItem
                                        icon="id-card-outline"
                                        label="Student Number"
                                        value="2024-00123"
                                    />
                                    <ProfileInfoItem
                                        icon="school-outline"
                                        label="Department"
                                        value="College of CS"
                                    />
                                    <ProfileInfoItem
                                        icon="business-outline"
                                        label="Institution"
                                        value="NU DASMARIÑAS"
                                        isLast
                                    />
                                </View>
                            </View>

                            <Text
                                className="mb-3 ml-1 text-xs font-bold uppercase tracking-widest opacity-60"
                                style={{ color: colors.text }}
                            >
                                Security
                            </Text>
                            <View
                                className="mb-8 rounded-2xl border p-6 shadow-sm"
                                style={{
                                    backgroundColor: colors.card,
                                    borderColor: isDark ? colors.border : 'rgba(0,0,0,0.05)',
                                    shadowColor: '#000',
                                    shadowOffset: {
                                        width: 0,
                                        height: 1,
                                    },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 2,
                                }}
                            >
                                <View className="mb-6 flex-row items-center">
                                    <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                                        <Ionicons
                                            name="shield-checkmark-outline"
                                            size={22}
                                            color={sentinelBlue}
                                        />
                                    </View>
                                    <View>
                                        <Text
                                            className="text-lg font-bold"
                                            style={{ color: colors.text }}
                                        >
                                            Update Password
                                        </Text>
                                        <Text
                                            className="mt-0.5 text-xs opacity-60"
                                            style={{ color: colors.text }}
                                        >
                                            Ensure your account stays secure
                                        </Text>
                                    </View>
                                </View>

                                <View className="gap-y-1">
                                    <PasswordInput
                                        label="Current Password"
                                        placeholder="Enter current password"
                                        value={passwords.current}
                                        onChangeText={(t) =>
                                            setPasswords({ ...passwords, current: t })
                                        }
                                    />
                                    <PasswordInput
                                        label="New Password"
                                        placeholder="Enter new password"
                                        value={passwords.new}
                                        onChangeText={(t) => setPasswords({ ...passwords, new: t })}
                                    />
                                    <PasswordInput
                                        label="Confirm Password"
                                        placeholder="Confirm new password"
                                        value={passwords.confirm}
                                        onChangeText={(t) =>
                                            setPasswords({ ...passwords, confirm: t })
                                        }
                                    />
                                </View>

                                <TouchableOpacity
                                    className="mt-6 items-center justify-center rounded-xl py-4 shadow-sm"
                                    style={{ backgroundColor: sentinelBlue }}
                                    activeOpacity={0.8}
                                    onPress={handleUpdatePassword}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-base font-bold text-white">
                                            Update Password
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                className="mb-8 items-center justify-center rounded-xl border bg-red-50 py-4 active:opacity-80 dark:bg-red-900/10"
                                style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                onPress={() => Alert.alert('Log out', 'Are you sure?')}
                            >
                                <Text className="text-base font-bold text-red-600">Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
}
