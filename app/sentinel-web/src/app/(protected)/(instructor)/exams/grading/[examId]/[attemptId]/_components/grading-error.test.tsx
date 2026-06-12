import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradingError } from './grading-error';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

describe('GradingError', () => {
    it('renders error content and handles back button click', () => {
        render(<GradingError examId="exam-123" />);
        expect(screen.getByText('Error Loading Submission')).toBeTruthy();

        const backButton = screen.getByRole('button', { name: /back to student list/i });
        expect(backButton).toBeTruthy();

        backButton.click();
        expect(mockPush).toHaveBeenCalledWith('/exams/grading/exam-123');
    });
});
