import { describe, it, expect } from 'vitest';
import { buildClassroomResponse } from './classroom-mappers';
import { RawClassroomRecord } from './classroom.types';

describe('buildClassroomResponse', () => {
    const mockRawClassroom: RawClassroomRecord = {
        class_group_id: '123',
        class_name: 'Test Class',
        subject_offering_id: null,
        subject_id: 'sub-123',
        subject_code: 'SUB101',
        subject_title: 'Introduction to Testing',
        section_id: 'sec-123',
        section_name: 'Section A',
        term_id: 'term-123',
        term_academic_year: '2023-2024',
        term_semester: '1st Semester',
        department_id: null,
        department_code: 'CS',
        department_name: 'Computer Science',
        course_id: null,
        course_code: 'BSCS',
        course_title: 'Bachelor of Science in Computer Science',
        year_level: 1,
        institution_id: 'inst-123',
        student_count: 30,
        exam_count: 5,
        created_at: '2023-01-01',
        updated_at: '2023-01-02',
        updated_by: 'user-123',
        updated_by_name: 'Admin User',
        instructors: ['John Doe', 'Jane Smith'],
    };

    it('should include instructors in the mapped response', () => {
        const result = buildClassroomResponse(mockRawClassroom);

        expect(result.instructors).toEqual(['John Doe', 'Jane Smith']);
        expect(result.class_group_id).toBe('123');
        expect(result.is_configured).toBe(true);
    });

    it('should handle instructors as a JSON string', () => {
        const rawWithStringInstructors = {
            ...mockRawClassroom,
            instructors: JSON.stringify(['John Doe', 'Jane Smith']) as any,
        };
        const result = buildClassroomResponse(rawWithStringInstructors);

        expect(result.instructors).toEqual(['John Doe', 'Jane Smith']);
    });

    it('should correctly format labels in scope_summary', () => {
        const result = buildClassroomResponse(mockRawClassroom);

        expect(result.scope_summary.subject_label).toBe('SUB101 - Introduction to Testing');
        expect(result.scope_summary.section_label).toBe('Section A');
        expect(result.scope_summary.term_label).toBe('2023-2024 • 1st Semester');
        expect(result.scope_summary.year_level_label).toBe('Year 1');
    });
});
