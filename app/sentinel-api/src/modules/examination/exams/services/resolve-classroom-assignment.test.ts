import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { Kysely, PostgresDialect } from 'kysely';
import {
    buildAccessibleClassroomAssignmentQuery,
    buildExamSectionAssignmentInputs,
} from './resolve-classroom-assignment.service';

function createCompilerDb() {
    return new Kysely<any>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString: 'postgres://sentinel:sentinel@127.0.0.1:5432/sentinel',
            }),
        }),
    });
}

describe('resolve-classroom-assignment query builder', () => {
    it('bypasses instructor enrollment checks when user is admin', () => {
        const db = createCompilerDb();
        const compiled = buildAccessibleClassroomAssignmentQuery({
            dbClient: db as unknown as DbClient,
            userId: 'user-admin-1',
            role: 'admin',
        }).compile();

        expect(compiled.sql).toContain('select "cg"."class_group_id"');
        expect(compiled.sql).not.toContain('class_roles');
        expect(compiled.sql).not.toContain('instructor');

        void db.destroy();
    });

    it('bypasses instructor enrollment checks when user is superadmin', () => {
        const db = createCompilerDb();
        const compiled = buildAccessibleClassroomAssignmentQuery({
            dbClient: db as unknown as DbClient,
            userId: 'user-superadmin-1',
            role: 'superadmin',
        }).compile();

        expect(compiled.sql).not.toContain('class_roles');

        void db.destroy();
    });

    it('bypasses instructor enrollment checks when user is support', () => {
        const db = createCompilerDb();
        const compiled = buildAccessibleClassroomAssignmentQuery({
            dbClient: db as unknown as DbClient,
            userId: 'user-support-1',
            role: 'support',
        }).compile();

        expect(compiled.sql).not.toContain('class_roles');

        void db.destroy();
    });

    it('enforces instructor enrollment check when role is instructor', () => {
        const db = createCompilerDb();
        const compiled = buildAccessibleClassroomAssignmentQuery({
            dbClient: db as unknown as DbClient,
            userId: 'user-instructor-1',
            role: 'instructor',
        }).compile();

        expect(compiled.sql).toContain('inner join "class_roles" as "cr"');
        expect(compiled.sql).toContain('"cr"."user_id" = $1');
        expect(compiled.sql).toContain('"r"."role_name" = $2');

        void db.destroy();
    });

    it('enforces instructor enrollment check when role is undefined', () => {
        const db = createCompilerDb();
        const compiled = buildAccessibleClassroomAssignmentQuery({
            dbClient: db as unknown as DbClient,
            userId: 'user-instructor-1',
        }).compile();

        expect(compiled.sql).toContain('inner join "class_roles" as "cr"');

        void db.destroy();
    });
});

describe('buildExamSectionAssignmentInputs', () => {
    it('creates assignment inputs correctly for single classroom, room, schedule and instructor', () => {
        const targets = {
            classroomAssignment: {
                classGroupId: 'class-group-1',
                className: 'Class A',
                institutionId: 'inst-1',
                subjectId: 'sub-1',
                subjectTitle: 'Subject 1',
                sectionId: 'sec-1',
                sectionName: 'Section 1',
            },
            assignedSectionIds: [],
            resolvedClassrooms: [
                {
                    classGroupId: 'class-group-1',
                    className: 'Class A',
                    institutionId: 'inst-1',
                    subjectId: 'sub-1',
                    subjectTitle: 'Subject 1',
                    sectionId: 'sec-1',
                    sectionName: 'Section 1',
                },
            ],
        };

        const inputs = buildExamSectionAssignmentInputs({
            targets,
            roomId: 'room-1',
            startDateTime: '2026-06-14T08:00:00Z',
            instructorId: 'inst-user-1',
        });

        expect(inputs).toEqual([
            {
                sectionId: 'sec-1',
                classGroupId: 'class-group-1',
                roomId: 'room-1',
                instructorId: 'inst-user-1',
                scheduledAt: '2026-06-14T08:00:00Z',
            },
        ]);
    });

    it('creates assignment inputs correctly for multiple selected sections', () => {
        const targets = {
            classroomAssignment: {
                classGroupId: 'class-group-1',
                className: 'Class A',
                institutionId: 'inst-1',
                subjectId: 'sub-1',
                subjectTitle: 'Subject 1',
                sectionId: 'sec-1',
                sectionName: 'Section 1',
            },
            assignedSectionIds: ['sec-2'],
            resolvedClassrooms: [
                {
                    classGroupId: 'class-group-1',
                    className: 'Class A',
                    institutionId: 'inst-1',
                    subjectId: 'sub-1',
                    subjectTitle: 'Subject 1',
                    sectionId: 'sec-1',
                    sectionName: 'Section 1',
                },
                {
                    classGroupId: 'class-group-2',
                    className: 'Class B',
                    institutionId: 'inst-1',
                    subjectId: 'sub-1',
                    subjectTitle: 'Subject 1',
                    sectionId: 'sec-2',
                    sectionName: 'Section 2',
                },
            ],
        };

        const inputs = buildExamSectionAssignmentInputs({
            targets,
            roomId: 'room-1',
            startDateTime: '2026-06-14T08:00:00Z',
            instructorIds: ['inst-user-1', 'inst-user-2'],
        });

        expect(inputs).toEqual([
            {
                sectionId: 'sec-1',
                classGroupId: 'class-group-1',
                roomId: 'room-1',
                instructorId: 'inst-user-1',
                scheduledAt: '2026-06-14T08:00:00Z',
            },
            {
                sectionId: 'sec-2',
                classGroupId: 'class-group-2',
                roomId: 'room-1',
                instructorId: 'inst-user-1',
                scheduledAt: '2026-06-14T08:00:00Z',
            },
        ]);
    });

    it('handles empty optional fields gracefully', () => {
        const targets = {
            classroomAssignment: {
                classGroupId: 'class-group-1',
                className: 'Class A',
                institutionId: 'inst-1',
                subjectId: 'sub-1',
                subjectTitle: 'Subject 1',
                sectionId: 'sec-1',
                sectionName: 'Section 1',
            },
            assignedSectionIds: [],
            resolvedClassrooms: [
                {
                    classGroupId: 'class-group-1',
                    className: 'Class A',
                    institutionId: 'inst-1',
                    subjectId: 'sub-1',
                    subjectTitle: 'Subject 1',
                    sectionId: 'sec-1',
                    sectionName: 'Section 1',
                },
            ],
        };

        const inputs = buildExamSectionAssignmentInputs({
            targets,
        });

        expect(inputs).toEqual([
            {
                sectionId: 'sec-1',
                classGroupId: 'class-group-1',
                roomId: null,
                instructorId: null,
                scheduledAt: null,
            },
        ]);
    });
});
