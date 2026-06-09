import { describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';
import SystemLogsPage from './page';

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

describe('SystemLogsPage Component', () => {
    it('redirects to /logs/auth', () => {
        SystemLogsPage();
        expect(redirect).toHaveBeenCalledWith('/logs/auth');
    });
});
