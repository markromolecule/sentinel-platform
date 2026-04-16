import { describe, expect, it } from 'vitest';
import {
    buildGroupedRequestPreviewText,
    buildRequestTargetCountBadges,
    canSubmitGroupedRequest,
    createStableCheckboxOptions,
    resolveSuggestedCourseIds,
    resolveSuggestedDepartmentIds,
    summarizeSelectedLabels,
} from './request-offered-subject-builder-helpers';
import {
    createRequestOfferedSubjectBuilderFormValues,
    EMPTY_REQUEST_OFFERED_SUBJECT_BUILDER_FORM_VALUES,
} from './request-offered-subject-builder-default-values';
import { requestOfferedSubjectBuilderFormSchema } from './request-offered-subject-builder-schema';

describe('requestOfferedSubjectBuilder helpers', () => {
    it('creates stable checkbox options with deduped values and sorted labels', () => {
        const options = createStableCheckboxOptions(
            [
                { id: '2', name: 'Zeta' },
                { id: '1', name: 'Alpha' },
                { id: '1', name: 'Alpha Duplicate' },
            ],
            (item) => item.id,
            (item) => item.name,
        );

        expect(options).toEqual([
            { value: '1', label: 'Alpha' },
            { value: '2', label: 'Zeta' },
        ]);
    });

    it('summarizes selected labels with a visible limit', () => {
        expect(summarizeSelectedLabels([], 'Nothing selected')).toBe('Nothing selected');
        expect(summarizeSelectedLabels(['CAS', 'COE', 'CBA', 'CCS'], 'Nothing selected', 2)).toBe(
            'CAS, COE +2 more',
        );
    });

    it('builds target count badges for the future request overview', () => {
        expect(
            buildRequestTargetCountBadges({
                departmentCount: 2,
                courseCount: 1,
                yearLevelCount: 3,
                sectionCount: 5,
            }),
        ).toEqual([
            {
                key: 'departments',
                label: 'Departments',
                count: 2,
                value: '2 departments',
            },
            {
                key: 'courses',
                label: 'Courses',
                count: 1,
                value: '1 course',
            },
            {
                key: 'year-levels',
                label: 'Year Levels',
                count: 3,
                value: '3 year levels',
            },
            {
                key: 'sections',
                label: 'Sections',
                count: 5,
                value: '5 sections',
            },
        ]);
    });

    it('builds grouped request preview text from the current selections', () => {
        expect(buildGroupedRequestPreviewText({})).toBe('No request targets selected yet.');

        expect(
            buildGroupedRequestPreviewText({
                departments: ['CAS', 'COE', 'CBA'],
                courses: ['BSIT', 'BSED'],
                yearLevels: ['Year 1', 'Year 2'],
                sections: ['IT-1A', 'IT-1B', 'ED-1A'],
            }),
        ).toBe(
            'This request currently targets 3 departments (CAS, COE +1 more), 2 courses (BSIT, BSED), 2 year levels (Year 1, Year 2), 3 sections (IT-1A, IT-1B +1 more).',
        );
    });

    it('only auto-selects request defaults when the offering resolves to a single option', () => {
        expect(
            resolveSuggestedDepartmentIds({
                selectedDepartmentIds: [],
                availableDepartmentIds: ['dept-a', 'dept-b'],
            }),
        ).toBeNull();

        expect(
            resolveSuggestedDepartmentIds({
                selectedDepartmentIds: [],
                availableDepartmentIds: ['dept-a'],
            }),
        ).toEqual(['dept-a']);

        expect(
            resolveSuggestedCourseIds({
                selectedCourseIds: [],
                visibleCourseIds: ['course-a'],
            }),
        ).toEqual(['course-a']);
    });

    it('enables submit for direct sections or complete grouped selections only', () => {
        expect(
            canSubmitGroupedRequest({
                departmentIds: [],
                courseIds: [],
                yearLevels: [],
                sectionIds: [],
            }),
        ).toBe(false);

        expect(
            canSubmitGroupedRequest({
                departmentIds: [],
                courseIds: [],
                yearLevels: [],
                sectionIds: ['section-1'],
            }),
        ).toBe(true);

        expect(
            canSubmitGroupedRequest({
                departmentIds: ['dept-a'],
                courseIds: ['course-a'],
                yearLevels: [1],
                sectionIds: [],
            }),
        ).toBe(true);
    });
});

describe('requestOfferedSubjectBuilder defaults and schema', () => {
    it('keeps empty builder defaults isolated from the legacy form model', () => {
        expect(EMPTY_REQUEST_OFFERED_SUBJECT_BUILDER_FORM_VALUES).toEqual({
            subject_offering_id: '',
            department_ids: [],
            course_ids: [],
            year_levels: [],
            section_ids: [],
        });

        expect(createRequestOfferedSubjectBuilderFormValues('offering-id')).toEqual({
            ...EMPTY_REQUEST_OFFERED_SUBJECT_BUILDER_FORM_VALUES,
            subject_offering_id: 'offering-id',
        });
    });

    it('accepts grouped builder values through the dedicated schema', () => {
        const parsed = requestOfferedSubjectBuilderFormSchema.parse({
            subject_offering_id: '00000000-0000-4000-8000-000000000001',
            department_ids: ['00000000-0000-4000-8000-000000000002'],
            course_ids: ['00000000-0000-4000-8000-000000000003'],
            year_levels: [1, 2],
            section_ids: ['00000000-0000-4000-8000-000000000004'],
        });

        expect(parsed).toEqual({
            subject_offering_id: '00000000-0000-4000-8000-000000000001',
            department_ids: ['00000000-0000-4000-8000-000000000002'],
            course_ids: ['00000000-0000-4000-8000-000000000003'],
            year_levels: [1, 2],
            section_ids: ['00000000-0000-4000-8000-000000000004'],
        });
    });
});
