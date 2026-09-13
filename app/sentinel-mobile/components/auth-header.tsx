import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Logo } from '@/components/logo';

export const AUTH_HEADER_HEIGHT = 220;
const { width } = Dimensions.get('window');

export interface AuthHeaderProps {
    variant?: 'white' | 'light';
    logoWidth?: number;
    logoHeight?: number;
    showBack?: boolean;
    onBackPress?: () => void;
}

export function AuthHeader({
    variant = 'white',
    logoWidth = 250,
    logoHeight = 70,
    showBack = false,
    onBackPress,
}: AuthHeaderProps) {
    return (
        <View style={styles.headerContainer}>
            <Svg
                width={width}
                height={AUTH_HEADER_HEIGHT}
                viewBox={`0 0 ${width} ${AUTH_HEADER_HEIGHT}`}
                style={styles.headerSvg}
            >
                <Path
                    d={`M0 0 L${width} 0 L${width} ${AUTH_HEADER_HEIGHT - 60} 
              C${width * 0.7} ${AUTH_HEADER_HEIGHT + 20} 
              ${width * 0.3} ${AUTH_HEADER_HEIGHT - 120} 
              0 ${AUTH_HEADER_HEIGHT - 60} 
              Z`}
                    fill={Colors.light.primary}
                />
            </Svg>

            {showBack && onBackPress && (
                <TouchableOpacity
                    onPress={onBackPress}
                    style={styles.backButton}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
            )}

            <View style={styles.headerContent}>
                <Logo variant={variant} width={logoWidth} height={logoHeight} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        height: AUTH_HEADER_HEIGHT,
        width: '100%',
        position: 'relative',
        backgroundColor: 'transparent',
    },
    headerSvg: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    headerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 40,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
});
