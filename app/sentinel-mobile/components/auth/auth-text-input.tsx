import React from 'react';
import {
    View,
    Text,
    TextInput,
    TextInputProps,
    StyleSheet,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Colors } from '@/constants/theme';

export interface AuthTextInputProps<T extends FieldValues>
    extends Omit<TextInputProps, 'defaultValue'> {
    control: Control<T>;
    name: FieldPath<T>;
    label: string;
    error?: string;
    containerStyle?: StyleProp<ViewStyle>;
}

export function AuthTextInput<T extends FieldValues>({
    control,
    name,
    label,
    error,
    containerStyle,
    style,
    ...textInputProps
}: AuthTextInputProps<T>) {
    return (
        <View style={[styles.inputGroup, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={[styles.input, style]}
                        placeholderTextColor={Colors.light.icon}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        {...textInputProps}
                    />
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
    input: {
        height: 52,
        borderWidth: 1,
        borderColor: Colors.light.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: Colors.light.text,
        backgroundColor: '#fff',
    },
    error: {
        fontSize: 12,
        color: Colors.light.error,
        marginTop: 2,
    },
});
