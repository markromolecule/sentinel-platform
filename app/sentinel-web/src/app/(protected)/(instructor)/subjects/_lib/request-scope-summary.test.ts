import { describe, expect, it } from 'vitest';
import {
    buildCourseSummary,
    buildDepartmentSummary,
    buildScopeSummary,
    buildSectionSummary,
    buildYearLevelSummary,
} from './request-scope-summary';

describe('request scope summary helpers', () => {
    it('builds grouped summaries for departments, courses, year levels, and sections', () => {
        expect(buildDepartmentSummary(['CAS'])).toBe('CAS');
        expect(buildDepartmentSummary(['CAS', 'COE'])).toBe('2 departments');
        expect(buildCourseSummary(['BSIT', 'BSED', 'BSN'])).toBe('3 courses');
        expect(buildYearLevelSummary([1])).toBe('Year 1');
        expect(buildYearLevelSummary([1, 2, 3])).toBe('3 year levels');
        expect(buildSectionSummary(4)).toBe('4 sections');
    });

    it('builds a combined scope summary for grouped request rows', () => {
        expect(
            buildScopeSummary({
                departments: ['CAS', 'COE'],
                courses: ['BSIT', 'BSED', 'BSN'],
                yearLevels: [1, 2],
                sectionCount: 12,
            }),
        ).toBe('2 departments, 3 courses, 2 year levels, 12 sections');
    });
});
