import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { RowClassroomCombobox } from './row-classroom-combobox';
import React from 'react';

afterEach(() => {
    cleanup();
});

const mockClassrooms = [
    {
        id: 'class-1',
        className: 'CS101 Intro',
        subjectCode: 'CS101',
        scopeSummary: {
            sectionLabel: 'Section A',
            termLabel: '2025-2026 1st Sem',
        },
    },
    {
        id: 'class-2',
        className: 'CS102 Data Structures',
        subjectCode: 'CS102',
        scopeSummary: {
            sectionLabel: 'Section B',
            termLabel: '2025-2026 1st Sem',
        },
    },
] as any[];

describe('RowClassroomCombobox', () => {
    it('renders and displays default placeholder text when value is none', () => {
        render(
            <RowClassroomCombobox
                value="none"
                onValueChange={() => {}}
                classrooms={mockClassrooms}
            />,
        );

        const input = screen.getByRole('combobox');
        expect(input.getAttribute('placeholder')).toBe('Select classroom');
    });

    it('filters classroom list based on search query matching class name or section', async () => {
        const onValueChangeMock = vi.fn();
        render(
            <RowClassroomCombobox
                value="none"
                onValueChange={onValueChangeMock}
                classrooms={mockClassrooms}
            />,
        );

        const input = screen.getByRole('combobox') as HTMLInputElement;
        fireEvent.focus(input);

        // Verify initially both classrooms are rendered
        await waitFor(() => {
            expect(screen.getByText('CS101 Intro')).toBeDefined();
            expect(screen.getByText('CS102 Data Structures')).toBeDefined();
        });

        // Type '102'
        fireEvent.change(input, { target: { value: '102' } });

        // CS102 should be visible, CS101 should be filtered out
        await waitFor(() => {
            expect(screen.getByText('CS102 Data Structures')).toBeDefined();
            expect(screen.queryByText('CS101 Intro')).toBeNull();
        });
    });
});
