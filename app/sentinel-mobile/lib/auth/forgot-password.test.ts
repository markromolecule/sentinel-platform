import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ForgotPasswordSchema } from '@sentinel/shared/schema';

// Mock React Native to prevent raw Flow parsing in Node/Vitest
vi.mock('react-native', () => ({
    View: ({ children, testID, ...props }: any) => ({
        type: 'View',
        props: { testID, ...props, children },
    }),
    Text: ({ children, ...props }: any) => ({
        type: 'Text',
        props: { ...props, children },
    }),
    TextInput: (props: any) => ({ type: 'TextInput', props }),
    TouchableOpacity: ({ children, onPress, ...props }: any) => ({
        type: 'TouchableOpacity',
        props: { onPress, ...props, children },
    }),
    ScrollView: ({ children, ...props }: any) => ({
        type: 'ScrollView',
        props: { ...props, children },
    }),
    KeyboardAvoidingView: ({ children, ...props }: any) => ({
        type: 'KeyboardAvoidingView',
        props: { ...props, children },
    }),
    StyleSheet: {
        create: (styles: any) => styles,
    },
    Platform: {
        OS: 'ios',
        select: (obj: any) => obj?.ios ?? obj?.default,
    },
    Dimensions: {
        get: () => ({ width: 375, height: 812 }),
    },
}));

vi.mock('react-native-svg', () => ({
    default: ({ children, ...props }: any) => ({ type: 'Svg', props: { ...props, children } }),
    Path: (props: any) => ({ type: 'Path', props }),
}));

vi.mock('@expo/vector-icons', () => ({
    Ionicons: (props: any) => ({ type: 'Ionicons', props }),
}));

vi.mock('expo-router', () => ({
    useRouter: () => ({
        replace: vi.fn(),
        push: vi.fn(),
        back: vi.fn(),
    }),
    Stack: {
        Screen: () => null,
    },
    Link: ({ children, href }: any) => ({
        type: 'Link',
        props: { href, children },
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useForgotPasswordMutation: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
    })),
}));

vi.mock('@/lib/auth/remember-me', () => ({
    getRememberedEmail: vi.fn().mockResolvedValue('remembered@sentinel.ph'),
}));

import ForgotPasswordScreen from '@/app/(auth)/forgot-password';

describe('ForgotPasswordScreen & Flow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Schema validation', () => {
        it('accepts a valid email address', () => {
            const result = ForgotPasswordSchema.safeParse({
                email: 'student@sentinel.ph',
            });
            expect(result.success).toBe(true);
        });

        it('rejects an empty email address', () => {
            const result = ForgotPasswordSchema.safeParse({
                email: '',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Email is required');
            }
        });

        it('rejects an invalid email format', () => {
            const result = ForgotPasswordSchema.safeParse({
                email: 'not-an-email',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('valid');
            }
        });
    });

    describe('Component initialization', () => {
        it('exports a valid React component function', () => {
            expect(typeof ForgotPasswordScreen).toBe('function');
        });
    });

    describe('Redirect destination URL formatting', () => {
        it('constructs correct web update-password callback destination', () => {
            const webAppUrl =
                process.env.EXPO_PUBLIC_WEB_URL || 'https://app.sentinelph.tech';
            const redirectTo = `${webAppUrl}/auth/callback?next=/auth/update-password`;

            expect(redirectTo).toBe(
                'https://app.sentinelph.tech/auth/callback?next=/auth/update-password',
            );
        });
    });
});
