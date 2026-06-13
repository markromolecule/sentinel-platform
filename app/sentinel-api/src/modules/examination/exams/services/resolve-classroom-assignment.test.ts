import { Pool } from 'pg';
import { describe, expect, it } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { Kysely, PostgresDialect } from 'kysely';
import { buildAccessibleClassroomAssignmentQuery } from './resolve-classroom-assignment';

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
