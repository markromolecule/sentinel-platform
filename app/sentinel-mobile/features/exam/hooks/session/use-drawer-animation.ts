import { useEffect } from 'react';
import {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';

export interface UseDrawerAnimationOptions {
    visible: boolean;
    screenHeight: number;
    duration?: number;
}

/**
 * Custom hook to control the slide up/down animation of the question navigator drawer.
 */
export function useDrawerAnimation({
    visible,
    screenHeight,
    duration = 300,
}: UseDrawerAnimationOptions) {
    const translateY = useSharedValue(screenHeight); // Start off-screen

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, {
                duration,
                easing: Easing.out(Easing.quad),
            });
        } else {
            translateY.value = withTiming(screenHeight, {
                duration,
                easing: Easing.in(Easing.quad),
            });
        }
    }, [visible, screenHeight, duration, translateY]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return {
        translateY,
        animatedStyle,
    };
}
