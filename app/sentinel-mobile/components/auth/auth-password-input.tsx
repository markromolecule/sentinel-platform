import React from 'react';
import {
    View,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    StyleSheet,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export interface AuthPasswordInputProps<T extends FieldValues>
    extends Omit<TextInputProps, 'defaultValue' | 'secureTextEntry'> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    error?: string;
    containerStyle?: StyleProp<ViewStyle>;
    showPassword?: boolean;
    onToggleShowPassword?: () => void;
}

export function AuthPasswordInput<T extends FieldValues>({
    control,
    name,
    label,
    error,
    containerStyle,
    style,
    showPassword = false,
    onToggleShowPassword,
    ...textInputProps
}: AuthPasswordInputProps<T>) {
    return (
        <View style={[styles.inputGroup, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.passwordInput, style]}
                            placeholderTextColor={Colors.light.icon}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            secureTextEntry={!showPassword}
                            {...textInputProps}
                        />
                        {onToggleShowPassword && (
                            <TouchableOpacity
                                onPress={onToggleShowPassword}
                                style={styles.eyeIcon}
                                accessibilityRole="button"
                                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={20}
                                    color={Colors.light.icon}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.text,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        height: 52,
        fontSize: 16,
        color: Colors.light.text,
    },
    eyeIcon: {
        padding: 4,
    },
    error: {
        fontSize: 12,
        color: Colors.light.error,
        marginTop: 2,
    },
});
