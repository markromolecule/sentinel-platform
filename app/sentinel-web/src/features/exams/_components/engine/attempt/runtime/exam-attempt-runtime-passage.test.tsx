'use client';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ExamAttemptRuntimePassage } from './exam-attempt-runtime-passage';
import {
    imageRuntimeFixture,
    longRuntimeFixture,
    malformedRuntimeFixture,
    noPassageRuntimeFixture,
    plainTextRuntimeFixture,
    richTextRuntimeFixture,
    runtimePassageFixtureQuestion,
} from './exam-attempt-runtime-passage.fixtures';

afterEach(() => {
    cleanup();
});

describe('ExamAttemptRuntimePassage', () => {
    it('does not render when the passage panel is hidden or there is no current question', () => {
        const { rerender, container } = render(
            <ExamAttemptRuntimePassage
                showPassagePanel={false}
                currentQuestion={runtimePassageFixtureQuestion as never}
                currentContext={plainTextRuntimeFixture}
            />,
        );

        expect(container.innerHTML).toBe('');

        rerender(
            <ExamAttemptRuntimePassage
                showPassagePanel
                currentQuestion={null}
                currentContext={plainTextRuntimeFixture}
            />,
        );

        expect(container.innerHTML).toBe('');
    });

    it('renders plain and rich text passage content', () => {
        const { rerender } = render(
            <ExamAttemptRuntimePassage
                showPassagePanel
                currentQuestion={runtimePassageFixtureQuestion as never}
                currentContext={plainTextRuntimeFixture}
            />,
        );

        expect(screen.getByText('Passage')).toBeTruthy();
        expect(screen.getByText(/Line 1/)).toBeTruthy();
        expect(screen.getByText(/Line 2/)).toBeTruthy();

        rerender(
            <ExamAttemptRuntimePassage
                showPassagePanel
                currentQuestion={runtimePassageFixtureQuestion as never}
                currentContext={richTextRuntimeFixture}
            />,
        );

        expect(screen.getByText(/Important/)).toBeTruthy();
        expect(screen.getByText(/Detail A/)).toBeTruthy();
        expect(screen.getByText(/Detail B/)).toBeTruthy();
    });

    it('renders responsive image content and preserves long passage bodies', () => {
        const { rerender } = render(
            <ExamAttemptRuntimePassage
                showPassagePanel
                currentQuestion={runtimePassageFixtureQuestion as never}
                currentContext={imageRuntimeFixture}
            />,
        );

        const body = screen.getByTestId('runtime-passage-body');
        const image = screen.getByRole('img', { name: 'Diagram' });

        expect(body.className).toContain('[&_img]:max-w-full');
        expect(image.getAttribute('src')).toBe('/fixtures/passage-diagram.png');

        rerender(
            <ExamAttemptRuntimePassage
                showPassagePanel
                currentQuestion={runtimePassageFixtureQuestion as never}
                currentContext={longRuntimeFixture}
            />,
        );

        expect(screen.getByText(/Paragraph 1/)).toBeTruthy();
        expect(screen.getByText(/Paragraph 30/)).toBeTruthy();
    });

    it('shows the empty state when no passage is attached', () => {
        render(
            <ExamAttemptRuntimePassage
                showPassagePanel
                currentQuestion={runtimePassageFixtureQuestion as never}
                currentContext={noPassageRuntimeFixture}
            />,
        );

        expect(screen.getByText(/No passage is attached to this question yet/i)).toBeTruthy();
    });

    it('renders sanitized malformed content without unsafe script or image markup', () => {
        const { container } = render(
            <ExamAttemptRuntimePassage
                showPassagePanel
                currentQuestion={runtimePassageFixtureQuestion as never}
                currentContext={malformedRuntimeFixture}
            />,
        );

        expect(screen.getByText(/Safe paragraph/)).toBeTruthy();
        expect(container.querySelector('script')).toBeNull();
        expect(screen.queryByRole('img', { name: 'Unsafe diagram' })).toBeNull();
        expect(container.innerHTML).not.toContain('javascript:alert');
    });
});
