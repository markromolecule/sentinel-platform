import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { SubjectSearchCombobox } from './subject-search-combobox';
import React from 'react';

afterEach(() => {
    cleanup();
});

const mockSubjects = [
    {
        id: 'sub-1',
        code: 'CS101',
        title: 'Introduction to Computer Science',
    },
    {
        id: 'sub-2',
        code: 'MATH101',
        title: 'College Algebra',
    },
    {
        id: 'sub-3',
        code: 'PHY101',
        title: 'General Physics',
    },
] as any[];

describe('SubjectSearchCombobox', () => {
    it('renders placeholder correctly', () => {
        render(
            <SubjectSearchCombobox
                onValueChange={() => {}}
                subjects={mockSubjects}
                isLoading={false}
            />,
        );

        const input = screen.getByPlaceholderText('Search a subject...');
        expect(input).toBeDefined();
    });

    it('renders disabled state when isLoading is true', () => {
        render(
            <SubjectSearchCombobox
                onValueChange={() => {}}
                subjects={mockSubjects}
                isLoading={true}
            />,
        );

        const input = screen.getByPlaceholderText('Loading subjects...');
        expect(input).toBeDefined();
        expect(input.hasAttribute('disabled')).toBe(true);
    });

    it('filters the list based on typing', async () => {
        const onValueChangeMock = vi.fn();
        render(
            <SubjectSearchCombobox
                value=""
                onValueChange={onValueChangeMock}
                subjects={mockSubjects}
            />,
        );

        const input = screen.getByPlaceholderText('Search a subject...') as HTMLInputElement;
        fireEvent.focus(input);

        // Verify initial list displays subjects
        await waitFor(() => {
            expect(screen.getByText('CS101')).toBeDefined();
            expect(screen.getByText('MATH101')).toBeDefined();
            expect(screen.getByText('PHY101')).toBeDefined();
        });

        // Type 'math'
        fireEvent.change(input, { target: { value: 'math' } });

        // MATH101 should remain, others should be filtered out
        await waitFor(() => {
            expect(screen.getByText('MATH101')).toBeDefined();
            expect(screen.queryByText('CS101')).toBeNull();
            expect(screen.queryByText('PHY101')).toBeNull();
        });
    });
});
