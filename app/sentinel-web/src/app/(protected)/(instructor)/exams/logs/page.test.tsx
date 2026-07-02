import { describe, expect, it, vi } from 'vitest';
import InstructorExamLogsLegacyPage from './page';

const mockRedirect = vi.fn();

vi.mock('next/navigation', () => ({
    redirect: (href: string) => mockRedirect(href),
}));

describe('InstructorExamLogsLegacyPage', () => {
    it('redirects legacy query-string log routes to the canonical path', async () => {
        await InstructorExamLogsLegacyPage({
            searchParams: Promise.resolve({
                examId: 'exam-1',
            }),
        });

        expect(mockRedirect).toHaveBeenCalledWith('/exams/exam-1/logs');
    });

    it('redirects missing exam ids back to the exams workspace', async () => {
        await InstructorExamLogsLegacyPage({
            searchParams: Promise.resolve({}),
        });

        expect(mockRedirect).toHaveBeenCalledWith('/exams');
    });
});
