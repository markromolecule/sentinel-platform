import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { RegisterForm } from './register-form';
import React from 'react';
import { useForm } from 'react-hook-form';
import { RegisterSchemaType } from '@sentinel/shared/schema';

function TestRegisterForm({
    captchaToken = null,
    isLoading = false,
    authError = null,
}: {
    captchaToken?: string | null;
    isLoading?: boolean;
    authError?: string | null;
}) {
    const form = useForm<RegisterSchemaType>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: false,
        },
    });

    return (
        <RegisterForm
            form={form}
            authError={authError}
            successMessage={null}
            isLoading={isLoading}
            captchaToken={captchaToken}
            onSubmit={vi.fn()}
        />
    );
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

describe('RegisterForm', () => {
    it('disables submit button when Turnstile site key is configured but captchaToken is not yet verified', () => {
        const originalSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
        process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY = 'test-sitekey';

        try {
            render(<TestRegisterForm captchaToken={null} />);
            const submitBtn = screen.getByRole('button', { name: /create account/i });
            expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
        } finally {
            process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY = originalSiteKey;
        }
    });

    it('enables submit button when captchaToken is verified and not loading', () => {
        const originalSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
        process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY = 'test-sitekey';

        try {
            render(<TestRegisterForm captchaToken="valid-token-xyz" isLoading={false} />);
            const submitBtn = screen.getByRole('button', { name: /create account/i });
            expect((submitBtn as HTMLButtonElement).disabled).toBe(false);
        } finally {
            process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY = originalSiteKey;
        }
    });

    it('disables submit button and shows loading state while registering', () => {
        render(<TestRegisterForm captchaToken="valid-token-xyz" isLoading={true} />);
        const submitBtn = screen.getByRole('button', { name: /creating account\.\.\./i });
        expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
    });

    it('displays auth error alert when authError is passed', () => {
        render(<TestRegisterForm authError="Security verification failed." />);
        expect(screen.getByText('Security verification failed.')).toBeTruthy();
    });
});
