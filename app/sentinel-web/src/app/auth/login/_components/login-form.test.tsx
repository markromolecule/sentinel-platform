import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { LoginForm } from './login-form';
import React from 'react';
import { useForm } from 'react-hook-form';
import { LoginSchemaType } from '@sentinel/shared/schema';

function TestLoginForm() {
    const form = useForm<LoginSchemaType>({
        defaultValues: {
            email: '',
            password: '',
        },
    });
    return <LoginForm form={form} authError={null} isLoading={false} onSubmit={vi.fn()} />;
}

// Mock ResizeObserver for Radix UI components in JSDOM
global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

afterEach(() => {
    cleanup();
});

describe('LoginForm', () => {
    it('renders the login form password input as password type initially', () => {
        render(<TestLoginForm />);
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        expect(passwordInput.getAttribute('type')).toBe('password');
    });

    it('toggles password visibility when the toggle button is clicked', () => {
        render(<TestLoginForm />);
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        expect(passwordInput.getAttribute('type')).toBe('password');

        const toggleButton = screen.getByLabelText('Toggle password visibility');
        expect(toggleButton).toBeTruthy();

        // Click to show password
        fireEvent.click(toggleButton);
        expect(passwordInput.getAttribute('type')).toBe('text');

        // Click to hide password
        fireEvent.click(toggleButton);
        expect(passwordInput.getAttribute('type')).toBe('password');
    });

    it('renders the forgot password link pointing to /auth/forgot-password', () => {
        render(<TestLoginForm />);
        const forgotPasswordLink = screen.getByRole('link', { name: /Forgot password\?/i });
        expect(forgotPasswordLink).toBeTruthy();
        expect(forgotPasswordLink.getAttribute('href')).toBe('/auth/forgot-password');
    });
});
