import { describe, expect, it } from 'vitest';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import {
    withExamAssignmentsLateralJoin,
    buildExamAssignmentSelects,
} from './build-exam-assignment-lateral-join';

function createCompilerDb() {
    return new Kysely<any>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString: 'postgres://sentinel:sentinel@127.0.0.1:5432/sentinel',
            }),
        }),
    });
}

describe('build-exam-assignment-lateral-join', () => {
    it('compiles a single LEFT JOIN LATERAL query attached to the exam query', () => {
        const db = createCompilerDb();
        let query = db.selectFrom('exams as e').select('e.exam_id');
        query = withExamAssignmentsLateralJoin(query, 'e');
        query = query.select(buildExamAssignmentSelects());

        const compiled = query.compile();

        // Verifies lateral join syntax
        expect(compiled.sql).toContain('left join lateral (');
        expect(compiled.sql).toContain('as esa_agg on true');

        // Verifies correlated reference to outer exam
        expect(compiled.sql).toContain('where esa.exam_id = "e"."exam_id"');

        // Verifies joined lookup tables
        expect(compiled.sql).toContain('from exam_section_assignments as esa');
        expect(compiled.sql).toContain('left join sections as s_inner on s_inner.section_id = esa.section_id');
        expect(compiled.sql).toContain('left join class_groups as cg_inner on cg_inner.class_group_id = esa.class_group_id');
        expect(compiled.sql).toContain('left join rooms as r_inner on r_inner.room_id = esa.room_id');
        expect(compiled.sql).toContain('left join user_profiles as up_inner on up_inner.user_id = esa.instructor_id');

        void db.destroy();
    });

    it('aggregates all 7 section, classroom, room, and instructor assignment dimensions with deterministic sorting and null filtering', () => {
        const db = createCompilerDb();
        let query = db.selectFrom('exams as e').select('e.exam_id');
        query = withExamAssignmentsLateralJoin(query, 'e');

        const compiled = query.compile();

        // section_names
        expect(compiled.sql).toContain('json_agg(distinct s_inner.section_name order by s_inner.section_name)');
        expect(compiled.sql).toContain('filter (where s_inner.section_name is not null)');

        // section_ids
        expect(compiled.sql).toContain('json_agg(distinct esa.section_id order by esa.section_id)');
        expect(compiled.sql).toContain('filter (where esa.section_id is not null)');

        // class_group_ids
        expect(compiled.sql).toContain('json_agg(distinct esa.class_group_id order by esa.class_group_id)');
        expect(compiled.sql).toContain('filter (where esa.class_group_id is not null)');

        // class_group_names
        expect(compiled.sql).toContain('json_agg(distinct cg_inner.class_name order by cg_inner.class_name)');
        expect(compiled.sql).toContain('filter (where cg_inner.class_name is not null)');

        // room_names
        expect(compiled.sql).toContain('json_agg(distinct r_inner.room_name order by r_inner.room_name)');
        expect(compiled.sql).toContain('filter (where r_inner.room_name is not null)');

        // instructor_names
        expect(compiled.sql).toContain('concat(up_inner.first_name, \' \', up_inner.last_name)');

        // instructor_ids
        expect(compiled.sql).toContain('json_agg(distinct esa.instructor_id order by esa.instructor_id)');
        expect(compiled.sql).toContain('filter (where esa.instructor_id is not null)');

        // Fallback coalesce to empty JSON array
        expect(compiled.sql).toContain("'[]'::json");

        void db.destroy();
    });

    it('projects all 7 fields via buildExamAssignmentSelects with expected alias names', () => {
        const db = createCompilerDb();
        let query = db.selectFrom('exams as e');
        query = withExamAssignmentsLateralJoin(query, 'e');
        query = query.select(buildExamAssignmentSelects());

        const compiled = query.compile();

        expect(compiled.sql).toContain('coalesce(esa_agg.section_names, \'[]\'::json) as "assigned_section_names"');
        expect(compiled.sql).toContain('coalesce(esa_agg.section_ids, \'[]\'::json) as "assigned_section_ids"');
        expect(compiled.sql).toContain('coalesce(esa_agg.class_group_ids, \'[]\'::json) as "assigned_class_group_ids"');
        expect(compiled.sql).toContain('coalesce(esa_agg.class_group_names, \'[]\'::json) as "assigned_class_group_names"');
        expect(compiled.sql).toContain('coalesce(esa_agg.room_names, \'[]\'::json) as "assigned_room_names"');
        expect(compiled.sql).toContain('coalesce(esa_agg.instructor_names, \'[]\'::json) as "assigned_instructor_names"');
        expect(compiled.sql).toContain('coalesce(esa_agg.instructor_ids, \'[]\'::json) as "assigned_instructor_ids"');

        void db.destroy();
    });
});
