import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock React Native to prevent raw Flow parsing in Node/Vitest
vi.mock('react-native', () => ({
    View: ({ children, testID, ...props }: any) =>
        React.createElement('View', { testID, ...props }, children),
    Text: ({ children, ...props }: any) =>
        React.createElement('Text', props, children),
    TextInput: (props: any) => React.createElement('TextInput', props),
    TouchableOpacity: ({ children, onPress, disabled, ...props }: any) =>
        React.createElement('TouchableOpacity', { onPress, disabled, ...props }, children),
    ActivityIndicator: (props: any) => React.createElement('ActivityIndicator', props),
    StyleSheet: {
        create: (styles: any) => styles,
    },
    Platform: {
        OS: 'ios',
        select: (obj: any) => obj?.ios ?? obj?.default,
    },
}));

vi.mock('@expo/vector-icons', () => ({
    Ionicons: (props: any) => React.createElement('Ionicons', props),
}));

// Mock expo-router
vi.mock('expo-router', () => ({
    Link: ({ children, href, style }: any) =>
        React.createElement('Link', { href, style }, children),
}));

import {
    AuthErrorAlert,
    AuthDivider,
    AuthFooter,
    AuthButton,
    AuthTextInput,
    AuthPasswordInput,
} from './index';


describe('Auth Components', () => {
    describe('AuthErrorAlert', () => {
        it('returns null when error is null or undefined', () => {
            const nullResult = AuthErrorAlert({ error: null });
            expect(nullResult).toBeNull();

            const undefResult = AuthErrorAlert({ error: undefined });
            expect(undefResult).toBeNull();
        });

        it('renders error message when error string is passed', () => {
            const result: any = AuthErrorAlert({ error: 'Invalid credentials' });
            expect(result).not.toBeNull();
            expect(result.props.children.props.children).toBe('Invalid credentials');
        });
    });

    describe('AuthDivider', () => {
        it('renders default divider text', () => {
            const result: any = AuthDivider({});
            expect(result.props.children[1].props.children).toBe('OR CONTINUE WITH');
        });

        it('renders custom divider text', () => {
            const result: any = AuthDivider({ text: 'OR SIGN IN USING' });
            expect(result.props.children[1].props.children).toBe('OR SIGN IN USING');
        });
    });

    describe('AuthFooter', () => {
        it('renders text, linkText, and href', () => {
            const result: any = AuthFooter({
                text: "Don't have an account?",
                linkText: 'Sign up',
                href: '/(auth)/register',
            });
            expect(result.props.children[0].props.children).toBe("Don't have an account?");
            expect(result.props.children[1].props.children).toBe('Sign up');
            expect(result.props.children[1].props.href).toBe('/(auth)/register');
        });
    });

    describe('AuthButton', () => {
        it('renders title when not loading', () => {
            const onPress = vi.fn();
            const result: any = AuthButton({
                title: 'Sign In',
                onPress,
                loading: false,
            });
            expect(result.props.children.props.children).toBe('Sign In');
            expect(result.props.disabled).toBe(false);
        });

        it('disables and shows loading indicator when loading', () => {
            const onPress = vi.fn();
            const result: any = AuthButton({
                title: 'Sign In',
                onPress,
                loading: true,
            });
            expect(result.props.disabled).toBe(true);
            expect(result.props.children.props.testID).toBe('auth-button-loading');
        });

        it('disables when disabled prop is true', () => {
            const onPress = vi.fn();
            const result: any = AuthButton({
                title: 'Sign In',
                onPress,
                disabled: true,
            });
            expect(result.props.disabled).toBe(true);
        });
    });

    describe('AuthTextInput', () => {
        it('renders label and handles validation error', () => {
            const mockControl: any = {};
            const result: any = AuthTextInput({
                control: mockControl,
                name: 'email' as any,
                label: 'Email Address',
                placeholder: 'Enter email',
                error: 'Invalid email address',
            });

            expect(result.props.children[0].props.children).toBe('Email Address');
            expect(result.props.children[2].props.children).toBe('Invalid email address');
        });
    });

    describe('AuthPasswordInput', () => {
        it('renders label, password input controller, and error message', () => {
            const mockControl: any = {};
            const result: any = AuthPasswordInput({
                control: mockControl,
                name: 'password' as any,
                label: 'Password',
                placeholder: 'Enter password',
                error: 'Password is required',
            });

            expect(result.props.children[0].props.children).toBe('Password');
            expect(result.props.children[2].props.children).toBe('Password is required');
        });

        it('supports controlled password visibility toggle', () => {
            const mockControl: any = {};
            const onToggle = vi.fn();
            const result: any = AuthPasswordInput({
                control: mockControl,
                name: 'password' as any,
                label: 'Password',
                showPassword: true,
                onToggleShowPassword: onToggle,
            });

            expect(result.props.children[0].props.children).toBe('Password');
        });
    });
});
