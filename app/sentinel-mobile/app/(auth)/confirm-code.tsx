import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { AuthHeader } from '@/components/auth-header';
import {
    AuthButton,
    AuthErrorAlert,
    AuthOtpInput,
} from '@/components/auth';
import { useConfirmCodeForm } from './hooks/use-confirm-code-form';
import styles from './style/confirm-code';

export default function ConfirmCodeScreen() {
    const {
        email,
        token,
        verifyError,
        successMessage,
        isVerifying,
        isResending,
        resendCooldown,
        onTokenChange,
        onVerify,
        onResend,
        onBackToRegister,
    } = useConfirmCodeForm();

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <AuthHeader
                variant="white"
                showBack={true}
                onBackPress={onBackToRegister}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formContainer}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {!email ? (
                        <View style={styles.emptyState}>
                            <View style={styles.iconCircle}>
                                <Ionicons
                                    name="alert-circle-outline"
                                    size={36}
                                    color={Colors.light.primary}
                                />
                            </View>
                            <Text style={styles.title}>Email Address Missing</Text>
                            <Text style={styles.subtitle}>
                                No registration email was provided. Please return to the
                                registration screen to create your account.
                            </Text>
                            <AuthButton
                                title="Back to Registration"
                                onPress={onBackToRegister}
                                style={{ width: '100%', marginTop: 8 }}
                            />
                        </View>
                    ) : (
                        <View style={styles.form}>
                            <View style={styles.headerSection}>
                                <View style={styles.iconCircle}>
                                    <Ionicons
                                        name="mail-open-outline"
                                        size={36}
                                        color={Colors.light.primary}
                                    />
                                </View>
                                <Text style={styles.title}>Check your inbox</Text>
                                <Text style={styles.subtitle}>
                                    We sent a 6-digit verification code to{'\n'}
                                    <Text style={styles.emailHighlight}>{email}</Text>
                                </Text>
                            </View>

                            {/* Success Banner */}
                            {successMessage && (
                                <View style={styles.successAlert}>
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={18}
                                        color="#059669"
                                    />
                                    <Text style={styles.successText}>{successMessage}</Text>
                                </View>
                            )}

                            {/* Error Alert */}
                            <AuthErrorAlert error={verifyError} />

                            <View>
                                <Text style={styles.label}>6-Digit Verification Code</Text>
                                <AuthOtpInput
                                    value={token}
                                    onChange={onTokenChange}
                                    disabled={isVerifying}
                                    hasError={Boolean(verifyError)}
                                    autoFocus={true}
                                />
                            </View>

                            <AuthButton
                                title={isVerifying ? 'Verifying...' : 'Verify & Continue'}
                                onPress={onVerify}
                                loading={isVerifying}
                                disabled={isVerifying || token.length !== 6}
                            />

                            <View style={styles.actionsRow}>
                                <TouchableOpacity
                                    onPress={onBackToRegister}
                                    disabled={isVerifying}
                                    style={styles.linkButton}
                                >
                                    <Ionicons
                                        name="arrow-back"
                                        size={14}
                                        color={Colors.light.icon}
                                    />
                                    <Text style={styles.linkText}>Change email address</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onResend}
                                    disabled={resendCooldown > 0 || isResending || isVerifying}
                                    style={styles.resendButton}
                                >
                                    <Ionicons
                                        name="refresh"
                                        size={14}
                                        color={
                                            resendCooldown > 0 || isResending || isVerifying
                                                ? '#9CA3AF'
                                                : Colors.light.primary
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.resendText,
                                            (resendCooldown > 0 || isResending || isVerifying) &&
                                            styles.resendDisabledText,
                                        ]}
                                    >
                                        {resendCooldown > 0
                                            ? `Resend in ${resendCooldown}s`
                                            : isResending
                                                ? 'Resending...'
                                                : 'Resend code'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>
                                    Need help accessing your account?{'\n'}
                                    Contact{' '}
                                    <Text style={styles.supportLink}>
                                        support@sentinelph.tech
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
