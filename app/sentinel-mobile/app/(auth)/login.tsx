import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Switch,
} from 'react-native';
import { Controller } from 'react-hook-form';
import { Link, Stack } from 'expo-router';
import { Colors } from '@/constants/theme';
import { SocialButton } from '@/components/social-button';
import { AuthHeader } from '@/components/auth-header';
import {
    AuthTextInput,
    AuthPasswordInput,
    AuthButton,
    AuthDivider,
    AuthErrorAlert,
    AuthFooter,
} from '@/components/auth';
import { useLoginForm } from './hooks/use-login-form';
import styles from './style/login';

export default function LoginScreen() {
    const {
        control,
        errors,
        showPassword,
        toggleShowPassword,
        authError,
        isSubmitting,
        googleLoading,
        onSubmit,
        handleGoogleLogin,
    } = useLoginForm();

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <AuthHeader variant="white" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formContainer}
            >
                <View style={styles.form}>
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

                    <AuthPasswordInput
                        control={control}
                        name="password"
                        label="Password"
                        placeholder="Enter your password"
                        showPassword={showPassword}
                        onToggleShowPassword={toggleShowPassword}
                        error={errors.password?.message}
                    />

                    <View style={styles.optionsRow}>
                        <View style={styles.rememberMe}>
                            <Controller
                                control={control}
                                name="remember"
                                render={({ field: { onChange, value } }) => (
                                    <Switch
                                        value={value}
                                        onValueChange={onChange}
                                        trackColor={{
                                            false: Colors.light.border,
                                            true: Colors.light.primary,
                                        }}
                                    />
                                )}
                            />
                            <Text style={styles.rememberText}>Remember me</Text>
                        </View>
                        <Link href="/(auth)/forgot-password" asChild>
                            <TouchableOpacity>
                                <Text style={styles.forgotPassword}>Forgot password?</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <AuthButton
                        title="Sign In"
                        onPress={onSubmit}
                        loading={isSubmitting}
                    />

                    <AuthDivider />

                    <SocialButton
                        title={googleLoading ? 'Connecting...' : 'Google'}
                        onPress={handleGoogleLogin}
                        disabled={googleLoading}
                        style={{ marginTop: 0 }}
                    />

                    <AuthFooter
                        text="Didn't have an account yet? "
                        linkText="Sign up"
                        href="/(auth)/register"
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

