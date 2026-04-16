import { describe, expect, it } from 'vitest';
import type { SubjectOfferingCourse, SubjectOfferingSection } from '@sentinel/shared/types';
import {
    deriveRequestBuilderYearLevels,
    filterRequestBuilderCoursesByDepartments,
    filterRequestBuilderSections,
    mergeRequestBuilderScopeIds,
} from './request-offered-subject-builder-filtering';

describe('requestOfferedSubjectBuilder filtering', () => {
    const courses: SubjectOfferingCourse[] = [
        {
            id: 'course-a',
            code: 'BSIT',
            title: 'BSIT',
        },
        {
            id: 'course-b',
            code: 'BSED',
            title: 'BSED',
        },
    ];

    const sections: SubjectOfferingSection[] = [
        {
            id: 'section-1',
            name: 'IT-1A',
            departmentId: 'dept-a',
            courseId: 'course-a',
            yearLevel: 1,
        },
        {
            id: 'section-2',
            name: 'IT-2A',
            departmentId: 'dept-a',
            courseId: 'course-a',
            yearLevel: 2,
        },
        {
            id: 'section-3',
            name: 'ED-1A',
            departmentId: 'dept-b',
            courseId: 'course-b',
            yearLevel: 1,
        },
        {
            id: 'section-4',
            name: 'LEGACY',
            departmentId: null,
            courseId: null,
        },
    ];

    it('filters courses by selected departments', () => {
        expect(filterRequestBuilderCoursesByDepartments(courses, sections, [])).toHaveLength(2);
        expect(
            filterRequestBuilderCoursesByDepartments(courses, sections, ['dept-a']).map(
                (course) => course.id,
            ),
        ).toEqual(['course-a']);
    });

    it('merges explicit offering scope with section-derived scope ids', () => {
        expect(mergeRequestBuilderScopeIds(['dept-a'], ['dept-b', 'dept-a'])).toEqual([
            'dept-a',
            'dept-b',
        ]);
    });

    it('filters sections by department, course, and year while tolerating legacy null metadata', () => {
        expect(
            filterRequestBuilderSections({
                sections,
                selectedDepartmentIds: ['dept-a'],
                selectedCourseIds: ['course-a'],
                selectedYearLevels: [1],
            }).map((section) => section.id),
        ).toEqual(['section-1', 'section-4']);
    });

    it('derives visible year levels from matching sections and offered scope', () => {
        expect(
            deriveRequestBuilderYearLevels({
                sections,
                offeredYearLevels: [1, 2, 3],
                selectedDepartmentIds: [],
                selectedCourseIds: [],
            }),
        ).toEqual([1, 2]);

        expect(
            deriveRequestBuilderYearLevels({
                sections,
                offeredYearLevels: [1, 2, 3],
                selectedDepartmentIds: ['dept-b'],
                selectedCourseIds: ['course-b'],
            }),
        ).toEqual([1]);

        expect(
            deriveRequestBuilderYearLevels({
                sections,
                offeredYearLevels: [1, 2, 3],
                selectedDepartmentIds: ['dept-missing'],
                selectedCourseIds: [],
            }),
        ).toEqual([]);
    });
});
