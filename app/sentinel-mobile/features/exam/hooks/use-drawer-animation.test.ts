import { vi, describe, it, expect, beforeEach } from 'vitest';

let effectCallbacks: Array<() => void | (() => void)> = [];

vi.mock('react', () => ({
    useEffect: (callback: () => void | (() => void)) => {
        effectCallbacks.push(callback);
    },
}));

const mockWithTiming = vi.fn((val: any, _config?: any) => val);
const mockUseAnimatedStyle = vi.fn((fn: any) => fn());
let sharedValueRef = { value: 800 };

vi.mock('react-native-reanimated', () => ({
    useSharedValue: (initial: any) => {
        sharedValueRef.value = initial;
        return sharedValueRef;
    },
    useAnimatedStyle: (fn: any) => mockUseAnimatedStyle(fn),
    withTiming: (val: any, config?: any) => mockWithTiming(val, config),
    Easing: {
        out: (fn: any) => fn,
        in: (fn: any) => fn,
        quad: 'quad',
    },
}));

import { useDrawerAnimation } from './use-drawer-animation';

describe('useDrawerAnimation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        effectCallbacks = [];
        sharedValueRef = { value: 800 };
    });

    it('initializes translateY to screenHeight and computes animatedStyle', () => {
        const { animatedStyle } = useDrawerAnimation({
            visible: false,
            screenHeight: 812,
        });

        expect(animatedStyle).toEqual({
            transform: [{ translateY: 812 }],
        });
    });

    it('animates to 0 when visible is true', () => {
        useDrawerAnimation({
            visible: true,
            screenHeight: 812,
        });

        for (const cb of effectCallbacks) {
            cb();
        }

        expect(mockWithTiming).toHaveBeenCalledWith(0, expect.objectContaining({ duration: 300 }));
    });

    it('animates to screenHeight when visible is false', () => {
        useDrawerAnimation({
            visible: false,
            screenHeight: 812,
        });

        for (const cb of effectCallbacks) {
            cb();
        }

        expect(mockWithTiming).toHaveBeenCalledWith(812, expect.objectContaining({ duration: 300 }));
    });
});
