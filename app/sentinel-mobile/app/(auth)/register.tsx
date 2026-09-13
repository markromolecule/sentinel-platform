import React from 'react';
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Logo } from '@/components/logo';
import { SocialButton } from '@/components/social-button';
import {
    AuthTextInput,
    AuthPasswordInput,
    AuthButton,
    AuthDivider,
    AuthErrorAlert,
    AuthFooter,
} from '@/components/auth';
import { useRegisterForm } from './hooks/use-register-form';
import styles from './style/register';

export default function RegisterScreen() {
    const {
        control,
        errors,
        showPassword,
        toggleShowPassword,
        showConfirmPassword,
        toggleShowConfirmPassword,
        authError,
        isSubmitting,
        googleLoading,
        onSubmit,
        handleGoogleRegister,
    } = useRegisterForm();

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoContainer}>
                    <Logo variant="light" width={220} height={60} />
                    <Text style={styles.subtitle}>Create your account</Text>
                </View>

                <View style={styles.form}>
                    <AuthErrorAlert error={authError} />

                    <View style={styles.row}>
                        <AuthTextInput
                            control={control}
                            name="firstName"
                            label="First Name"
                            placeholder="John"
                            error={errors.firstName?.message}
                            containerStyle={{ flex: 1 }}
                        />
                        <AuthTextInput
                            control={control}
                            name="lastName"
                            label="Last Name"
                            placeholder="Doe"
                            error={errors.lastName?.message}
                            containerStyle={{ flex: 1 }}
                        />
                    </View>

                    <AuthTextInput
                        control={control}
                        name="email"
                        label="Email Address"
                        placeholder="m@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        error={errors.email?.message}
                    />

                    <AuthPasswordInput
                        control={control}
                        name="password"
                        label="Password"
                        placeholder="••••••••"
                        showPassword={showPassword}
                        onToggleShowPassword={toggleShowPassword}
                        error={errors.password?.message}
                    />

                    <AuthPasswordInput
                        control={control}
                        name="confirmPassword"
                        label="Confirm Password"
                        placeholder="••••••••"
                        showPassword={showConfirmPassword}
                        onToggleShowPassword={toggleShowConfirmPassword}
                        error={errors.confirmPassword?.message}
                    />

                    <View style={styles.actions}>
                        <AuthButton
                            title="Sign Up"
                            onPress={onSubmit}
                            loading={isSubmitting}
                        />

                        <AuthDivider />

                        <SocialButton
                            title={googleLoading ? 'Connecting...' : 'Google'}
                            onPress={handleGoogleRegister}
                            disabled={googleLoading}
                            style={{ marginTop: 0 }}
                        />
                    </View>

                    <AuthFooter
                        text="Already have an account? "
                        linkText="Sign in"
                        href="/(auth)/login"
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

