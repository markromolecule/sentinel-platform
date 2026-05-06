import { View, Text, TouchableOpacity } from 'react-native';
import { type BottomCTAProps } from '@/types/exam';

export function BottomCTA({ colors, onPress, label = 'Proceed', disabled = false }: BottomCTAProps) {
    return (
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: 32,
                backgroundColor: colors.background,
                borderTopWidth: 1,
                borderTopColor: colors.border,
            }}
        >
            <TouchableOpacity
                style={{
                    backgroundColor: disabled ? colors.border : colors.primary,
                    paddingVertical: 16,
                    borderRadius: 16,
                    shadowColor: disabled ? colors.border : colors.primary,
                    shadowOpacity: disabled ? 0 : 0.3,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: disabled ? 0 : 6,
                    opacity: disabled ? 0.75 : 1,
                }}
                onPress={onPress}
                disabled={disabled}
                accessibilityLabel={label}
                accessibilityRole="button"
                accessibilityState={{ disabled }}
                activeOpacity={disabled ? 1 : 0.85}
            >
                <Text
                    style={{
                        color: '#fff',
                        textAlign: 'center',
                        fontSize: 16,
                        fontWeight: '700',
                        letterSpacing: 0.3,
                    }}
                >
                    {label}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
