import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ForgotPasswordSchema,
    ForgotPasswordSchemaType,
} from '@sentinel/shared/schema';
import { useRouter, Stack } from 'expo-router';
import { useForgotPasswordMutation } from '@sentinel/hooks';
import { Colors } from '@/constants/theme';
import { AuthHeader } from '@/components/auth-header';
import {
    AuthTextInput,
    AuthButton,
    AuthErrorAlert,
    AuthFooter,
} from '@/components/auth';
import { getRememberedEmail } from '@/lib/auth/remember-me';
import { Ionicons } from '@expo/vector-icons';
import styles from './style/forgot-password';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [authError, setAuthError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState('');

    const form = useForm<ForgotPasswordSchemaType>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const {
        setValue,
        handleSubmit,
        control,
        formState: { errors },
    } = form;

    const forgotPasswordMutation = useForgotPasswordMutation({
        onSuccess: () => {
            setIsSubmitted(true);
        },
        onError: (error) => {
            setAuthError(error.message);
        },
    });

    useEffect(() => {
        let isMounted = true;
        const loadSavedEmail = async () => {
            const savedEmail = await getRememberedEmail();
            if (savedEmail && isMounted) {
                setValue('email', savedEmail);
            }
        };

        loadSavedEmail();

        return () => {
            isMounted = false;
        };
    }, [setValue]);

    const onSubmit = (data: ForgotPasswordSchemaType) => {
        setAuthError(null);
        setSubmittedEmail(data.email);

        const webAppUrl =
            process.env.EXPO_PUBLIC_WEB_URL || 'https://app.sentinelph.tech';
        const redirectTo = `${webAppUrl}/auth/callback?next=/auth/update-password`;

        forgotPasswordMutation.mutate({
            email: data.email,
            redirectTo,
        });
    };

    const handleBackToLogin = () => {
        router.replace('/(auth)/login');
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <AuthHeader
                variant="white"
                showBack={true}
                onBackPress={handleBackToLogin}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formContainer}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {isSubmitted ? (
                        <View style={styles.confirmationContainer}>
                            <View style={styles.iconCircle}>
                                <Ionicons
                                    name="mail-open-outline"
                                    size={36}
                                    color={Colors.light.primary}
                                />
                            </View>

                            <Text style={styles.confirmationTitle}>Check Your Email</Text>

                            <Text style={styles.confirmationMessage}>
                                We have sent password reset instructions to{' '}
                                <Text style={styles.emailHighlight}>{submittedEmail}</Text>.
                            </Text>

                            <View style={styles.instructionsCard}>
                                <View style={styles.instructionRow}>
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={18}
                                        color={Colors.light.primary}
                                    />
                                    <Text style={styles.instructionText}>
                                        Open the email link to update your password in your web browser.
                                    </Text>
                                </View>

                                <View style={styles.instructionRow}>
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={18}
                                        color={Colors.light.primary}
                                    />
                                    <Text style={styles.instructionText}>
                                        After updating your password, return to this app to sign in.
                                    </Text>
                                </View>
                            </View>

                            <AuthButton
                                title="Back to Sign In"
                                onPress={handleBackToLogin}
                                style={{ width: '100%', marginTop: 16 }}
                            />

                            <TouchableOpacity
                                onPress={() => setIsSubmitted(false)}
                                style={styles.backButton}
                            >
                                <Ionicons
                                    name="refresh-outline"
                                    size={16}
                                    color={Colors.light.primary}
                                />
                                <Text style={styles.backButtonText}>
                                    Didn't receive the email? Try again
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.form}>
                            <Text style={styles.title}>Forgot Password</Text>
                            <Text style={styles.subtitle}>
                                Enter your registered email address and we will send you a link to
                                reset your password.
                            </Text>

                            <AuthErrorAlert error={authError} />

                            <AuthTextInput
                                control={control}
                                name="email"
                                label="Email Address"
                                placeholder="Enter your email address"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                error={errors.email?.message}
                            />

                            <AuthButton
                                title="Send Reset Link"
                                onPress={handleSubmit(onSubmit)}
                                loading={forgotPasswordMutation.isPending}
                            />

                            <AuthFooter
                                text="Remember your password? "
                                linkText="Sign in"
                                href="/(auth)/login"
                            />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
