import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { UpdatePasswordForm } from './update-password-form';
import React from 'react';
import { useForm } from 'react-hook-form';

function TestUpdatePasswordForm() {
    const form = useForm({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });
    return <UpdatePasswordForm form={form} authError={null} isLoading={false} onSubmit={vi.fn()} />;
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

describe('UpdatePasswordForm', () => {
    it('renders the update password inputs as password type initially', () => {
        render(<TestUpdatePasswordForm />);
        const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
        expect(newPasswordInput.getAttribute('type')).toBe('password');
        expect(confirmPasswordInput.getAttribute('type')).toBe('password');
    });

    it('toggles password and confirm password visibility independently', () => {
        render(<TestUpdatePasswordForm />);
        const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');

        const toggleNewButton = screen.getByLabelText('Toggle password visibility');
        const toggleConfirmButton = screen.getByLabelText('Toggle confirm password visibility');

        // Toggle new password field
        fireEvent.click(toggleNewButton);
        expect(newPasswordInput.getAttribute('type')).toBe('text');
        expect(confirmPasswordInput.getAttribute('type')).toBe('password');

        // Toggle confirm password field
        fireEvent.click(toggleConfirmButton);
        expect(newPasswordInput.getAttribute('type')).toBe('text');
        expect(confirmPasswordInput.getAttribute('type')).toBe('text');

        // Toggle both back
        fireEvent.click(toggleNewButton);
        fireEvent.click(toggleConfirmButton);
        expect(newPasswordInput.getAttribute('type')).toBe('password');
        expect(confirmPasswordInput.getAttribute('type')).toBe('password');
    });
});
