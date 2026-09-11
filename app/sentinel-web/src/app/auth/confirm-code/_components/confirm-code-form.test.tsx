/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfirmCodeForm } from './confirm-code-form';

const mockUseConfirmCodeForm = vi.fn();

vi.mock('../_hooks/use-confirm-code-form', () => ({
    useConfirmCodeForm: () => mockUseConfirmCodeForm(),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ConfirmCodeForm Component', () => {
    it('renders the email target, 6-digit input, and submit button', () => {
        mockUseConfirmCodeForm.mockReturnValue({
            email: 'student.test@gmail.com',
            token: '',
            verifyError: null,
            successMessage: 'A 6-digit verification code was sent to your email.',
            isVerifying: false,
            isResending: false,
            resendCooldown: 60,
            onTokenChange: vi.fn(),
            onSubmit: vi.fn(),
            onResend: vi.fn(),
        });

        render(<ConfirmCodeForm />);

        expect(screen.getByText('Check your inbox')).toBeTruthy();
        expect(screen.getByText('student.test@gmail.com')).toBeTruthy();
        expect(screen.getByPlaceholderText('••••••')).toBeTruthy();

        const submitButton = screen.getByRole('button', { name: /Verify & Continue/i });
        expect(submitButton).toBeTruthy();
        expect(submitButton.hasAttribute('disabled')).toBe(true); // token is empty
    });

    it('displays error alerts when verifyError is set', () => {
        mockUseConfirmCodeForm.mockReturnValue({
            email: 'student.test@gmail.com',
            token: '123456',
            verifyError: 'Invalid or expired code',
            successMessage: null,
            isVerifying: false,
            isResending: false,
            resendCooldown: 0,
            onTokenChange: vi.fn(),
            onSubmit: vi.fn(),
            onResend: vi.fn(),
        });

        render(<ConfirmCodeForm />);

        expect(screen.getByText('Invalid or expired code')).toBeTruthy();
        const resendButton = screen.getByRole('button', { name: /Resend code/i });
        expect(resendButton.hasAttribute('disabled')).toBe(false);
    });

    it('displays cooldown timer when resendCooldown > 0', () => {
        mockUseConfirmCodeForm.mockReturnValue({
            email: 'student.test@gmail.com',
            token: '123456',
            verifyError: null,
            successMessage: null,
            isVerifying: false,
            isResending: false,
            resendCooldown: 42,
            onTokenChange: vi.fn(),
            onSubmit: vi.fn(),
            onResend: vi.fn(),
        });

        render(<ConfirmCodeForm />);

        expect(screen.getByText(/Resend code in 42s/i)).toBeTruthy();
    });
});
