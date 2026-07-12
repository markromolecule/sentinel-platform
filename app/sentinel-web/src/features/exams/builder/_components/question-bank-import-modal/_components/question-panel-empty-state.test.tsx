'use client';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { QuestionPanelEmptyState } from './question-panel-empty-state';

afterEach(() => {
    cleanup();
});

describe('QuestionPanelEmptyState', () => {
    it('renders title and description', () => {
        render(
            <QuestionPanelEmptyState
                title="No items found"
                description="Try modifying search criteria."
            />,
        );

        expect(screen.getByText('No items found')).toBeTruthy();
        expect(screen.getByText('Try modifying search criteria.')).toBeTruthy();
    });

    it('renders animated loader icon when loading is active', () => {
        const { container } = render(
            <QuestionPanelEmptyState
                title="Loading questions"
                description="Please wait..."
                isLoading={true}
            />,
        );

        expect(screen.queryByText('Loading questions')).toBeNull();
        expect(screen.queryByText('Please wait...')).toBeNull();
        expect(container.querySelector('.animate-spin')).toBeTruthy();
    });
});
