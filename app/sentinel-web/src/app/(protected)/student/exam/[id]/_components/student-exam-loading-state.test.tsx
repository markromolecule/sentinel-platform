import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudentExamLoadingState } from './student-exam-loading-state';

describe('StudentExamLoadingState', () => {
    it('renders the loading text and spinner elements without container wrappers', () => {
        const { container } = render(<StudentExamLoadingState />);

        expect(screen.getByText('Loading exam flow...')).toBeDefined();
        expect(screen.getByLabelText('Loading exam flow')).toBeDefined();
        expect(screen.queryByText('Preparing the current exam state.')).toBeNull();

        // Ensure there are no card-like bordered or shadow container classes in the outer wrapper
        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv.className).toContain('flex');
        expect(outerDiv.className).toContain('items-center');
        expect(outerDiv.className).not.toContain('border');
        expect(outerDiv.className).not.toContain('shadow');
        expect(outerDiv.className).not.toContain('bg-card');
    });
});
