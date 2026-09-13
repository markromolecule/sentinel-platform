import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VerifyOtpSchema } from '@sentinel/shared/schema';

// Hoisted state for React mock
const { hookState } = vi.hoisted(() => ({
    hookState: {
        values: [] as any[],
        index: 0,
        effects: [] as Array<() => void | (() => void)>,
    },
}));

vi.mock('react', () => {
    const createElement = (type: any, props: any, ...children: any[]) => ({
        type,
        props: {
            ...props,
            children:
                children.length === 0
                    ? props?.children
                    : children.length === 1
                      ? children[0]
                      : children,
        },
    });

    const mock = {
        useState: (initialValue: any) => {
            const currentIndex = hookState.index;
            if (hookState.values[currentIndex] === undefined) {
                hookState.values[currentIndex] = initialValue;
            }
            const value = hookState.values[currentIndex];
            const setValue = (newValue: any) => {
                if (typeof newValue === 'function') {
                    hookState.values[currentIndex] = newValue(hookState.values[currentIndex]);
                } else {
                    hookState.values[currentIndex] = newValue;
                }
            };
            hookState.index++;
            return [value, setValue];
        },
        useEffect: (callback: () => void | (() => void)) => {
            hookState.effects.push(callback);
        },
        useCallback: (fn: any) => fn,
        useMemo: (fn: any) => fn(),
        useRef: (initial: any) => ({ current: initial }),
        createElement,
    };

    return {
        ...mock,
        default: mock,
    };
});

// Mock React Native primitives
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

const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock('expo-router', () => ({
    useRouter: () => ({
        replace: mockReplace,
        push: mockPush,
    }),
    useLocalSearchParams: () => ({
        email: encodeURIComponent('student@sentinel.ph'),
    }),
    Stack: {
        Screen: () => null,
    },
}));

const mockVerifyMutate = vi.fn();
let verifyMutationCallbacks: any = {};
const mockResend = vi.fn().mockResolvedValue({ error: null });

vi.mock('@sentinel/hooks', () => ({
    useVerifyOtpMutation: (options: any) => {
        verifyMutationCallbacks = options;
        return {
            mutate: mockVerifyMutate,
            isPending: false,
        };
    },
    useAuth: () => ({
        supabase: {
            auth: {
                resend: mockResend,
            },
        },
    }),
}));

import ConfirmCodeScreen from '@/app/(auth)/confirm-code';
import { useConfirmCodeForm } from '@/app/(auth)/hooks/use-confirm-code-form';

describe('ConfirmCodeScreen & Flow', () => {
    beforeEach(() => {
        hookState.values = [];
        hookState.index = 0;
        hookState.effects = [];
        vi.clearAllMocks();
    });

    describe('VerifyOtpSchema validation', () => {
        it('accepts a valid 6-digit numeric token and email', () => {
            const result = VerifyOtpSchema.safeParse({
                email: 'student@sentinel.ph',
                token: '123456',
                type: 'signup',
            });
            expect(result.success).toBe(true);
        });

        it('rejects tokens shorter than 6 digits', () => {
            const result = VerifyOtpSchema.safeParse({
                email: 'student@sentinel.ph',
                token: '12345',
                type: 'signup',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    'Verification code must be exactly 6 digits',
                );
            }
        });

        it('rejects tokens containing non-numeric characters', () => {
            const result = VerifyOtpSchema.safeParse({
                email: 'student@sentinel.ph',
                token: '12345A',
                type: 'signup',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe(
                    'Verification code must contain only numbers',
                );
            }
        });

        it('rejects empty or invalid email address', () => {
            const result = VerifyOtpSchema.safeParse({
                email: 'invalid-email',
                token: '123456',
                type: 'signup',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Invalid email address');
            }
        });
    });

    describe('Component initialization', () => {
        it('exports a valid React component function', () => {
            expect(typeof ConfirmCodeScreen).toBe('function');
        });
    });

    describe('Post-Verification Navigation to Onboarding', () => {
        it('strictly redirects to /(onboarding) upon verification success', () => {
            useConfirmCodeForm();

            expect(verifyMutationCallbacks.onSuccess).toBeDefined();
            verifyMutationCallbacks.onSuccess({ session: { access_token: 'fake-jwt' } });

            expect(mockReplace).toHaveBeenCalledWith('/(onboarding)');
        });

        it('triggers auto-verification mutation when 6 digits are entered', () => {
            // Seed token state with a 6-digit string
            hookState.values[0] = '654321';

            useConfirmCodeForm();

            // Run effect callbacks (including auto-verification effect)
            hookState.effects.forEach((cb) => cb());

            expect(mockVerifyMutate).toHaveBeenCalledWith({
                email: 'student@sentinel.ph',
                token: '654321',
                type: 'signup',
            });
        });

        it('handles resend by calling supabase.auth.resend', async () => {
            // Set resendCooldown (index 3) to 0 before calling hook to permit resend
            hookState.values[3] = 0;

            const hook = useConfirmCodeForm();

            await hook.onResend();

            expect(mockResend).toHaveBeenCalledWith({
                type: 'signup',
                email: 'student@sentinel.ph',
            });
        });
    });
});
