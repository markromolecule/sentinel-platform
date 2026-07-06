import { type Insertable, type Updateable } from 'kysely';
import type { DB } from '@sentinel/db';
import type { CreateExamBody, UpdateExamBody } from '../exam.dto';

type ExamSectionColumnSupport = {
    hasSectionId: boolean;
    hasSectionName: boolean;
    hasRoomId: boolean;
};

function hasOwnProperty<Value extends object, Key extends PropertyKey>(
    value: Value | null | undefined,
    key: Key,
): value is Value & Record<Key, unknown> {
    return value != null && Object.prototype.hasOwnProperty.call(value, key);
}

function readSettingOverride(
    payload:
        | Pick<
              CreateExamBody,
              | 'shuffleQuestions'
              | 'showCorrectAnswers'
              | 'allowReview'
              | 'randomizeChoices'
              | 'settings'
          >
        | Pick<
              UpdateExamBody,
              | 'shuffleQuestions'
              | 'showCorrectAnswers'
              | 'allowReview'
              | 'randomizeChoices'
              | 'settings'
          >,
    key: 'shuffleQuestions' | 'showCorrectAnswers' | 'allowReview' | 'randomizeChoices',
) {
    if (hasOwnProperty(payload.settings, key)) {
        return payload.settings[key];
    }

    if (hasOwnProperty(payload, key)) {
        return payload[key];
    }

    return undefined;
}

export function buildExamSettingsInput(
    payload:
        | Pick<
              CreateExamBody,
              | 'shuffleQuestions'
              | 'showCorrectAnswers'
              | 'allowReview'
              | 'randomizeChoices'
              | 'settings'
          >
        | Pick<
              UpdateExamBody,
              | 'shuffleQuestions'
              | 'showCorrectAnswers'
              | 'allowReview'
              | 'randomizeChoices'
              | 'settings'
          >,
) {
    return {
        shuffleQuestions: readSettingOverride(payload, 'shuffleQuestions'),
        showCorrectAnswers: readSettingOverride(payload, 'showCorrectAnswers'),
        allowReview: readSettingOverride(payload, 'allowReview'),
        randomizeChoices: readSettingOverride(payload, 'randomizeChoices'),
    };
}

export function buildCreateExamValues(args: {
    body: CreateExamBody;
    institutionId?: string;
    userId: string;
    sectionColumnSupport?: ExamSectionColumnSupport;
    classroomAssignment: {
        classGroupId: string;
        subjectId: string;
        sectionId: string | null;
        sectionName: string | null;
    };
}): Insertable<DB['exams']> {
    const { body, institutionId, userId, sectionColumnSupport, classroomAssignment } = args;

    const values: Insertable<DB['exams']> = {
        title: body.title,
        description: body.description,
        class_group_id: classroomAssignment.classGroupId,
        subject_id: classroomAssignment.subjectId,
        duration_minutes: body.durationMinutes,
        passing_score: body.passingScore ?? null,
        scheduled_date: body.startDateTime ? new Date(body.startDateTime) : null,
        end_date_time: body.endDateTime ? new Date(body.endDateTime) : null,
        status: 'DRAFT',
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        institution_id: institutionId ?? body.institutionId ?? null,
        question_count: body.questions?.length ?? 0,
        exam_category: body.examCategory ?? 'CLASSROOM',
        is_public: body.isPublic ?? false,
    };

    if (sectionColumnSupport?.hasSectionId) {
        values.section_id = classroomAssignment.sectionId;
    }

    if (sectionColumnSupport?.hasSectionName) {
        values.section_name = classroomAssignment.sectionName;
    }

    if (sectionColumnSupport?.hasRoomId) {
        values.room_id = body.roomId ?? null;
    }

    return values;
}

export function buildUpdateExamValues(args: {
    body: UpdateExamBody;
    institutionId?: string;
    userId: string;
    sectionColumnSupport?: ExamSectionColumnSupport;
    classroomAssignment?: {
        classGroupId: string | null;
        subjectId: string | null;
        sectionId: string | null;
        sectionName: string | null;
    };
}): Updateable<DB['exams']> {
    const { body, institutionId, userId, sectionColumnSupport, classroomAssignment } = args;
    const hasPassingScore = hasOwnProperty(body, 'passingScore');

    const values: Updateable<DB['exams']> = {
        title: body.title,
        description: body.description,
        class_group_id: classroomAssignment?.classGroupId,
        subject_id: classroomAssignment?.subjectId ?? body.subjectId,
        status: body.status ? (body.status.toUpperCase().replace('-', '_') as any) : undefined,
        duration_minutes: body.durationMinutes,
        passing_score: hasPassingScore ? (body.passingScore ?? null) : undefined,
        scheduled_date: body.startDateTime ? new Date(body.startDateTime) : undefined,
        end_date_time: body.endDateTime ? new Date(body.endDateTime) : undefined,
        updated_by: userId,
        updated_at: new Date(),
        institution_id: institutionId ?? body.institutionId,
        question_count: body.questions?.length,
        exam_category: body.examCategory,
        is_public: body.isPublic,
    };

    if (sectionColumnSupport?.hasSectionId) {
        values.section_id = classroomAssignment?.sectionId ?? body.sectionId;
    }

    if (sectionColumnSupport?.hasSectionName) {
        values.section_name = classroomAssignment?.sectionName ?? (body as any).section;
    }

    if (sectionColumnSupport?.hasRoomId && body.roomId !== undefined) {
        values.room_id = body.roomId ?? null;
    }

    return values;
}
