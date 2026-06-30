import { describe, it, expect } from 'vitest';
import { mapSubjectOfferingResponse } from './map-subject-offering-response';

describe('mapSubjectOfferingResponse', () => {
    it('should correctly map standard fields and instructors array', () => {
        const mockRawOffering = {
            subject_offering_id: 'offering-id-1',
            subject_id: 'subject-id-1',
            subject_code: 'INF231',
            subject_title: 'Introduction to Computing',
            term_id: 'term-id-1',
            term_academic_year: '2026-2027',
            term_semester: '1st Semester',
            status: 'OPEN',
            department_ids: ['dept-1'],
            course_ids: ['course-1'],
            section_ids: ['section-1'],
            year_levels: [1],
            departments: [{ id: 'dept-1', code: 'CS', name: 'Computer Science' }],
            courses: [{ id: 'course-1', code: 'BSCS', title: 'BS Computer Science' }],
            sections: [
                {
                    id: 'class-group-1',
                    class_group_id: 'class-group-1',
                    section_id: 'section-1',
                    name: 'CS1A',
                },
            ],
            classifications: [{ id: 'class-1', name: 'Core Subjects', type: 'CORE' }],
            instructors: [
                {
                    id: 'instructor-1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                },
            ],
        };

        const result = mapSubjectOfferingResponse(mockRawOffering);

        expect(result.subject_offering_id).toBe('offering-id-1');
        expect(result.subject_code).toBe('INF231');
        expect(result.instructors).toBeDefined();
        expect(result.instructors).toHaveLength(1);
        expect(result.instructors?.[0]).toEqual({
            id: 'instructor-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
        });
        expect(result.sections).toEqual([
            {
                id: 'class-group-1',
                name: 'CS1A',
                department_id: null,
                course_id: null,
                section_id: 'section-1',
                year_level: null,
                class_group_id: 'class-group-1',
            },
        ]);
    });

    it('should handle empty or missing instructors list', () => {
        const mockRawOffering = {
            subject_offering_id: 'offering-id-1',
            subject_id: 'subject-id-1',
            subject_code: 'INF231',
            subject_title: 'Introduction to Computing',
            term_id: 'term-id-1',
            term_academic_year: '2026-2027',
            term_semester: '1st Semester',
            status: 'OPEN',
            department_ids: [],
            course_ids: [],
            section_ids: [],
            year_levels: [],
            departments: [],
            courses: [],
            sections: [],
            classifications: [],
        };

        const result = mapSubjectOfferingResponse(mockRawOffering);

        expect(result.instructors).toBeDefined();
        expect(result.instructors).toEqual([]);
    });

    it('filters out sections without real classroom assignments', () => {
        const result = mapSubjectOfferingResponse({
            subject_offering_id: 'offering-id-2',
            subject_id: 'subject-id-2',
            subject_code: 'INF232',
            subject_title: 'Data Structures',
            term_id: 'term-id-2',
            term_academic_year: '2026-2027',
            term_semester: '1st Semester',
            status: 'OPEN',
            department_ids: [],
            course_ids: [],
            section_ids: [],
            year_levels: [],
            departments: [],
            courses: [],
            sections: [
                {
                    id: 'section-only-1',
                    class_group_id: null,
                    section_id: null,
                    name: 'CS1B',
                },
                {
                    id: 'class-group-2',
                    class_group_id: 'class-group-2',
                    section_id: 'section-2',
                    name: 'CS1C',
                },
            ],
            classifications: [],
            instructors: [],
        });

        expect(result.sections).toEqual([
            {
                id: 'class-group-2',
                name: 'CS1C',
                department_id: null,
                course_id: null,
                section_id: 'section-2',
                year_level: null,
                class_group_id: 'class-group-2',
            },
        ]);
    });
});
