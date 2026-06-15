import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ExamCardBody } from './exam-card-body';
import type { ExamCardProps } from '@sentinel/shared/types';

function buildExam(overrides: Partial<ExamCardProps['exam']> = {}): ExamCardProps['exam'] {
    return {
        id: 'exam-1',
        title: 'Midterm Exam',
        description: 'An exam for testing the assignment rows.',
        duration: 60,
        passingScore: 75,
        status: 'draft',
        createdAt: '2026-06-14T07:00:00.000Z',
        updatedAt: '2026-06-14T07:30:00.000Z',
        subject: 'Ethics',
        assignedRoomNames: ['ROOM101', 'ROOM102'],
        assignedInstructorNames: ['Juan dela Cruz', 'Maria Santos'],
        createdByName: 'Keanna Mae Cloma',
        ...overrides,
    } as ExamCardProps['exam'];
}

describe('ExamCardBody', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders assigned rooms, instructors, and creator attribution', () => {
        render(<ExamCardBody exam={buildExam()} />);

        expect(screen.getByText('ROOM101, ROOM102')).toBeTruthy();
        expect(screen.getByText('Juan dela Cruz, Maria Santos')).toBeTruthy();
        expect(screen.getByText('Draft by Keanna Mae Cloma')).toBeTruthy();
    });

    it('renders a draft note when the exam has no questions', () => {
        render(
            <ExamCardBody
                exam={buildExam({
                    status: 'draft',
                    questionCount: 0,
                })}
            />,
        );

        expect(screen.getAllByText('Draft — no questions added yet').length).toBeGreaterThan(0);
    });

    it('does not render the draft note when the exam has questions', () => {
        render(
            <ExamCardBody
                exam={buildExam({
                    status: 'draft',
                    questionCount: 4,
                })}
            />,
        );

        expect(screen.queryAllByText('Draft — no questions added yet')).toHaveLength(0);
    });

    it('renders published by attribution for published exams', () => {
        render(
            <ExamCardBody
                exam={buildExam({
                    status: 'published',
                    publishedByName: 'Published By User',
                    createdByName: null,
                })}
            />,
        );

        expect(screen.getByText('Published by Published By User')).toBeTruthy();
    });

    it('falls back to an em dash when room and instructor assignments are empty', () => {
        render(
            <ExamCardBody
                exam={buildExam({
                    assignedRoomNames: [],
                    assignedInstructorNames: [],
                    createdByName: null,
                })}
            />,
        );

        expect(screen.getAllByText('–').length).toBeGreaterThanOrEqual(2);
    });
});
