/**
 * Tests for ExamCardBody — verifies assignment-sourced room and instructor display.
 *
 * These tests ensure:
 * - When `assignedRoomNames` is empty or undefined the card shows '–' for room.
 * - When `assignedRoomNames` has entries they are joined comma-separated.
 * - When `assignedInstructorNames` is empty or undefined the card shows '–' for instructor.
 * - When `assignedInstructorNames` has entries they are joined comma-separated.
 * - sectionNames are joined with ' • ' when provided.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExamCardBody } from './exam-card-body';

/** Minimal exam fixture that satisfies ExamCardBody's required props. */
function buildExam(overrides: Record<string, unknown> = {}) {
    return {
        id: 'exam-1',
        title: 'Midterm Exam',
        subject: 'Mathematics',
        classroomName: null,
        section: null,
        sectionNames: [],
        scheduledDate: null,
        endDateTime: null,
        questionCount: 10,
        status: 'DRAFT',
        assignedRoomNames: [],
        assignedInstructorNames: [],
        ...overrides,
    } as unknown as ExamCardProps['exam'];
}

describe('ExamCardBody', () => {
    it('shows dash for room when assignedRoomNames is empty', () => {
        render(<ExamCardBody exam={buildExam({ assignedRoomNames: [], assignedInstructorNames: [] })} />);
        // Both room and instructor will show '–'; getAllByTitle confirms at least 2 dash elements
        const dashSpans = screen.getAllByTitle('–');
        expect(dashSpans.length).toBeGreaterThanOrEqual(2);
    });

    it('shows dash for room when assignedRoomNames is undefined', () => {
        render(<ExamCardBody exam={buildExam({ assignedRoomNames: undefined })} />);
        // Component renders '–' as text
        const dashElements = screen.getAllByText('–');
        expect(dashElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows comma-separated rooms when multiple rooms assigned', () => {
        render(
            <ExamCardBody
                exam={buildExam({ assignedRoomNames: ['ROOM101', 'ROOM201'] })}
            />,
        );
        expect(screen.getByText('ROOM101, ROOM201')).toBeDefined();
    });

    it('shows single room name without comma when one room assigned', () => {
        render(
            <ExamCardBody
                exam={buildExam({ assignedRoomNames: ['LAB101'] })}
            />,
        );
        expect(screen.getByText('LAB101')).toBeDefined();
    });

    it('shows dash for instructor when assignedInstructorNames is empty', () => {
        render(<ExamCardBody exam={buildExam({ assignedInstructorNames: [] })} />);
        const dashElements = screen.getAllByText('–');
        expect(dashElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows comma-separated instructors when multiple instructors assigned', () => {
        render(
            <ExamCardBody
                exam={buildExam({
                    assignedInstructorNames: ['Juan dela Cruz', 'Maria Santos'],
                })}
            />,
        );
        expect(screen.getByText('Juan dela Cruz, Maria Santos')).toBeDefined();
    });

    it('shows single instructor name when one instructor assigned', () => {
        render(
            <ExamCardBody
                exam={buildExam({ assignedInstructorNames: ['Juan dela Cruz'] })}
            />,
        );
        expect(screen.getByText('Juan dela Cruz')).toBeDefined();
    });

    it('shows sectionNames joined with bullet when provided', () => {
        render(
            <ExamCardBody
                exam={buildExam({ sectionNames: ['CS401', 'CS402'] })}
            />,
        );
        expect(screen.getByText('CS401 • CS402')).toBeDefined();
    });

    it('does not show draft attribution text for draft exams', () => {
        render(
            <ExamCardBody
                exam={buildExam({
                    status: 'draft',
                    createdByName: 'John Creator',
                })}
            />,
        );
        expect(screen.queryByText('Draft by John Creator')).toBeNull();
        expect(screen.queryByText('Draft')).toBeNull();
    });

    it('shows Published by publisher name under published status', () => {
        render(
            <ExamCardBody
                exam={buildExam({
                    status: 'published',
                    publishedByName: 'Jane Publisher',
                })}
            />,
        );
        expect(screen.getByText('Published by Jane Publisher')).toBeDefined();
    });

    it('shows Created by creator name when published but publisher is null', () => {
        render(
            <ExamCardBody
                exam={buildExam({
                    status: 'published',
                    publishedByName: null,
                    createdByName: 'John Creator',
                })}
            />,
        );
        expect(screen.getByText('Created by John Creator')).toBeDefined();
    });
});
