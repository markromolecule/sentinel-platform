import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { DayDetailsSheet } from './day-details-sheet';
import React from 'react';

vi.mock('@sentinel/hooks', () => ({
    useAuth: () => ({
        user: { id: 'user-1' },
    }),
}));

describe('DayDetailsSheet', () => {
    afterEach(() => {
        cleanup();
    });

    const mockEvents = [
        {
            id: 'event-1',
            title: 'Exam event',
            date: new Date('2026-06-20T10:00:00Z'),
            type: 'exam',
            description: 'History test description',
            duration: 90,
            studentsCount: 15,
        },
        {
            id: 'note-1',
            title: 'My personal note',
            date: new Date('2026-06-20T11:00:00Z'),
            type: 'note',
            description: 'Note details description',
            startTime: '10:00 AM',
            endTime: '11:00 AM',
            createdBy: 'user-1',
            createdByName: 'John Doe',
        },
    ];

    const defaultProps = {
        isOpen: true,
        onOpenChange: vi.fn(),
        selectedDate: new Date('2026-06-20T00:00:00Z'),
        getEventsForDate: vi.fn().mockReturnValue(mockEvents),
        onDeleteEvent: vi.fn(),
    };

    it('renders date heading and events list correctly', () => {
        render(<DayDetailsSheet {...defaultProps} />);
        expect(screen.getByText('June 20, 2026')).toBeTruthy();
        expect(screen.getByText('Exam event')).toBeTruthy();
        expect(screen.getByText('My personal note')).toBeTruthy();
    });

    it('renders empty message when no events are scheduled', () => {
        render(
            <DayDetailsSheet {...defaultProps} getEventsForDate={vi.fn().mockReturnValue([])} />,
        );
        expect(screen.getByText('No events scheduled')).toBeTruthy();
    });

    it('displays posted by name for notes', () => {
        render(<DayDetailsSheet {...defaultProps} />);
        expect(screen.getByText(/John Doe/)).toBeTruthy();
    });
});
