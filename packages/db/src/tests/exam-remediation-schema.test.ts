import { describe, expect, expectTypeOf, it } from 'vitest';
import type { Selectable } from 'kysely';
import {
    exam_remediation_type,
    type DB,
    type exam_remediation_schedules,
} from '../generated/types';

describe('exam remediation schema types', () => {
    it('exposes the remediation type enum in generated DB types', () => {
        expect(exam_remediation_type.RETAKE).toBe('RETAKE');
        expect(exam_remediation_type.MAKEUP).toBe('MAKEUP');
    });

    it('includes the remediation schedule table in the DB mapping', () => {
        const record: Selectable<exam_remediation_schedules> = {
            remediation_id: 'fcb4774e-698b-4aa9-863b-a50f1062bf4a',
            source_exam_id: '1fd52d94-e6d9-4519-b38a-b17b6ccddf74',
            remediation_exam_id: '2fd52d94-e6d9-4519-b38a-b17b6ccddf75',
            student_id: '2d519509-537d-4bfd-af39-76118cbad154',
            source_attempt_id: '3fd52d94-e6d9-4519-b38a-b17b6ccddf76',
            remediation_type: 'RETAKE',
            scheduled_date: new Date(),
            end_date_time: new Date(),
            created_by: '6d854648-305e-4eff-82d4-b64458284eeb',
            created_at: new Date(),
            notes: 'Test notes',
        };

        expect(record.remediation_type).toBe('RETAKE');
        expectTypeOf<DB['exam_remediation_schedules']>().toEqualTypeOf<exam_remediation_schedules>();
    });
});
