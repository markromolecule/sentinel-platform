import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/theme';

export interface AuthOtpInputProps {
    value: string;
    onChange: (value: string) => void;
    length?: number;
    disabled?: boolean;
    autoFocus?: boolean;
    hasError?: boolean;
}

export function AuthOtpInput({
    value,
    onChange,
    length = 6,
    disabled = false,
    autoFocus = true,
    hasError = false,
}: AuthOtpInputProps) {
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    const handleCellPress = () => {
        if (!disabled) {
            inputRef.current?.focus();
        }
    };

    const handleChangeText = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
        onChange(cleaned);
    };

    const digits = Array.from({ length }, (_, i) => value[i] || '');

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={handleCellPress}
            style={styles.container}
            testID="auth-otp-input-container"
        >
            <TextInput
                ref={inputRef}
                value={value}
                onChangeText={handleChangeText}
                keyboardType="number-pad"
                inputMode="numeric"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={length}
                autoFocus={autoFocus}
                editable={!disabled}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={styles.hiddenInput}
                testID="auth-otp-hidden-input"
            />

            <View style={styles.cellsRow}>
                {digits.map((digit, index) => {
                    const isCellFocused =
                        isFocused &&
                        (index === value.length ||
                            (index === length - 1 && value.length === length));

                    return (
                        <View
                            key={index}
                            style={[
                                styles.cell,
                                digit ? styles.filledCell : null,
                                isCellFocused ? styles.activeCell : null,
                                hasError ? styles.errorCell : null,
                            ]}
                            testID={`auth-otp-cell-${index}`}
                        >
                            <Text style={styles.cellText}>{digit}</Text>
                        </View>
                    );
                })}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    cellsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        width: '100%',
    },
    cell: {
        width: 48,
        height: 56,
        borderRadius: 12,
        backgroundColor: Colors.light.input,
        borderWidth: 1.5,
        borderColor: Colors.light.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filledCell: {
        borderColor: Colors.light.border,
        backgroundColor: '#fff',
    },
    activeCell: {
        borderColor: Colors.light.primary,
        borderWidth: 2,
        backgroundColor: '#fff',
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 2,
    },
    errorCell: {
        borderColor: Colors.light.error,
        backgroundColor: '#fff',
    },
    cellText: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
        textAlign: 'center',
    },
});
