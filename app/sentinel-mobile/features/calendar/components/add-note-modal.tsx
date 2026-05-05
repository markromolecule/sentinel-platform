import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    useColorScheme,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

interface AddNoteModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: () => void;
    selectedDate: Date;
    noteText: string;
    onChangeText: (text: string) => void;
}

export const AddNoteModal = ({
    visible,
    onClose,
    onSave,
    selectedDate,
    noteText,
    onChangeText,
}: AddNoteModalProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const showSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => setIsKeyboardVisible(true),
        );
        const hideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setIsKeyboardVisible(false),
        );

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={{ flex: 1 }}>
                {/* Backdrop */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                        }}
                    />
                </TouchableWithoutFeedback>

                {/* Main Sheet */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{
                        justifyContent: 'flex-end',
                    }}
                >
                    <View
                        className="w-full rounded-t-[24px] shadow-2xl"
                        style={{
                            backgroundColor: colors.background,
                            paddingBottom: isKeyboardVisible ? 16 : insets.bottom + 16,
                            paddingHorizontal: 20,
                            paddingTop: 10,
                            borderTopWidth: 1,
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        }}
                    >
                        {/* Drag Handle Indicator */}
                        <View className="mb-4 items-center">
                            <View
                                className="h-1 w-10 rounded-full"
                                style={{
                                    backgroundColor: isDark
                                        ? 'rgba(255,255,255,0.15)'
                                        : 'rgba(0,0,0,0.08)',
                                }}
                            />
                        </View>

                        {/* Header Section */}
                        <View className="mb-4 flex-row items-center justify-between">
                            <View className="mr-4 flex-1">
                                <Text
                                    className="text-2xl font-bold tracking-tight"
                                    style={{ color: colors.text }}
                                >
                                    New Note
                                </Text>
                                <View className="mt-1 flex-row items-center opacity-50">
                                    <Ionicons
                                        name="calendar-outline"
                                        size={12}
                                        color={colors.text}
                                        style={{ marginRight: 4 }}
                                    />
                                    <Text
                                        className="text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: colors.text }}
                                    >
                                        {selectedDate.toLocaleDateString([], {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={onClose}
                                className="h-10 w-10 items-center justify-center rounded-full"
                                style={{ backgroundColor: isDark ? '#27272a' : '#f4f4f5' }}
                            >
                                <Ionicons name="close" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Text Input Area */}
                        <TextInput
                            className="mb-6 p-0 text-base leading-6"
                            style={{
                                color: colors.text,
                                minHeight: 80,
                                textAlignVertical: 'top',
                            }}
                            placeholder="Add your note here..."
                            placeholderTextColor={colors.icon}
                            multiline
                            value={noteText}
                            onChangeText={onChangeText}
                            autoFocus
                            selectionColor={colors.primary}
                        />

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={onSave}
                            className="w-full flex-row items-center justify-center rounded-xl py-3 shadow-sm active:opacity-90"
                            style={{
                                backgroundColor: colors.primary,
                                shadowColor: colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 6,
                                elevation: 3,
                            }}
                        >
                            <Ionicons
                                name="checkmark"
                                size={18}
                                color="white"
                                style={{ marginRight: 6 }}
                            />
                            <Text className="text-base font-bold text-white">Save Note</Text>
                        </TouchableOpacity>
                    </View>

                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
