import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Switch,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginSchemaType } from '@sentinel/shared/schema';
import { useRouter, Link, Stack, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { SocialButton } from '@/components/social-button';
import { Logo } from '@/components/logo';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useLoginMutation } from '@sentinel/hooks';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import {
    getMobileAuthCallbackUrl,
    getOAuthBrowserStartUrl,
    getOAuthCallbackError,
    getOAuthProviderRedirectUrl,
    setSessionFromOAuthCallback,
} from '@/lib/auth/oauth-callback';
import styles, { HEADER_HEIGHT } from './style/login';

// Required to complete the OAuth session on iOS
WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ error?: string }>();
    const mobileAuthCallbackUrl = getMobileAuthCallbackUrl();
    const oauthProviderRedirectUrl = getOAuthProviderRedirectUrl();
    const [showPassword, setShowPassword] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const loginMutation = useLoginMutation({
        onSuccess: () => {
            router.replace('/(tabs)/classroom');
        },
        onError: (error) => {
            setAuthError(error.message);
        },
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchemaType>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: '',
            password: '',
            remember: false,
        },
    });

    const onSubmit = (data: LoginSchemaType) => {
        setAuthError(null);
        loginMutation.mutate(data);
    };

    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleError, setGoogleError] = useState<string | null>(null);

    useEffect(() => {
        if (params.error) {
            setGoogleError(params.error);
        }
    }, [params.error]);

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            setGoogleError(null);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: oauthProviderRedirectUrl,
                    queryParams: {
                        prompt: 'select_account',
                    },
                    skipBrowserRedirect: true,
                },
            });

            if (error) {
                throw error;
            }

            if (!data.url) {
                throw new Error('No OAuth URL returned.');
            }

            if (__DEV__) {
                console.info('Sentinel mobile OAuth callback URL:', mobileAuthCallbackUrl);
                console.info('Sentinel OAuth provider redirect URL:', oauthProviderRedirectUrl);
                console.info('Sentinel mobile OAuth URL:', data.url);
                console.info(
                    'Sentinel browser OAuth start URL:',
                    getOAuthBrowserStartUrl(data.url),
                );
            }

            const result = await WebBrowser.openAuthSessionAsync(
                getOAuthBrowserStartUrl(data.url),
                mobileAuthCallbackUrl,
            );

            if (result.type === 'success' && result.url) {
                const callbackError = getOAuthCallbackError(result.url);

                if (callbackError) {
                    throw new Error(callbackError);
                }

                const sessionResult = await setSessionFromOAuthCallback(result.url);

                if (sessionResult.status === 'success') {
                    router.replace('/(tabs)/classroom');
                    return;
                }
            }

            if (result.type === 'cancel' || result.type === 'dismiss') {
                throw new Error('Google login was cancelled.');
            }

            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
                router.replace('/(tabs)/classroom');
                return;
            }

            throw new Error('Authentication callback did not include a session.');
        } catch (err: any) {
            setGoogleError(err.message || 'Google login failed. Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Curved Header Background */}
            <View style={styles.headerContainer}>
                <Svg
                    width={width}
                    height={HEADER_HEIGHT}
                    viewBox={`0 0 ${width} ${HEADER_HEIGHT}`}
                    style={styles.headerSvg}
                >
                    <Path
                        d={`M0 0 L${width} 0 L${width} ${HEADER_HEIGHT - 60} 
              C${width * 0.7} ${HEADER_HEIGHT + 20} 
              ${width * 0.3} ${HEADER_HEIGHT - 120} 
              0 ${HEADER_HEIGHT - 60} 
              Z`}
                        fill={Colors.light.primary}
                    />
                </Svg>
                <View style={styles.headerContent}>
                    <Logo variant="white" width={250} height={70} />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formContainer}
            >
                <View style={styles.form}>
                    {(authError || googleError) && (
                        <View className="mb-4 rounded-lg bg-red-50 p-3">
                            <Text className="text-center text-sm font-medium text-red-600">
                                {authError || googleError}
                            </Text>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email address"
                                    placeholderTextColor={Colors.light.icon}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            )}
                        />
                        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        placeholder="Enter your password"
                                        placeholderTextColor={Colors.light.icon}
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={20}
                                            color={Colors.light.icon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        {errors.password && (
                            <Text style={styles.error}>{errors.password.message}</Text>
                        )}
                    </View>

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
                        <TouchableOpacity onPress={() => console.log('Forgot password')}>
                            <Text style={styles.forgotPassword}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loginMutation.isPending && { opacity: 0.7 }]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <SocialButton
                        title={googleLoading ? 'Connecting...' : 'Google'}
                        onPress={handleGoogleLogin}
                        disabled={googleLoading}
                        style={{ marginTop: 0 }}
                    />
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Didn't have an account yet? </Text>
                        <Link href="/(auth)/register" style={styles.link}>
                            Sign up
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
