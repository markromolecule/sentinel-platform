import { type Insertable, type Updateable } from 'kysely';
import type { DB } from '@sentinel/db';
import type { CreateExamBody, UpdateExamBody } from '../exam.dto';

type ExamSectionColumnSupport = {
    hasSectionId: boolean;
    hasSectionName: boolean;
    hasRoomId: boolean;
};

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
        shuffleQuestions: payload.settings?.shuffleQuestions ?? payload.shuffleQuestions ?? false,
        showCorrectAnswers:
            payload.settings?.showCorrectAnswers ?? payload.showCorrectAnswers ?? false,
        allowReview: payload.settings?.allowReview ?? payload.allowReview ?? false,
        randomizeChoices:
            payload.settings?.randomizeChoices ?? payload.randomizeChoices ?? false,
    };
}

export function buildCreateExamValues(args: {
    body: CreateExamBody;
    institutionId?: string;
    userId: string;
    sectionColumnSupport?: ExamSectionColumnSupport;
}): Insertable<DB['exams']> {
    const { body, institutionId, userId, sectionColumnSupport } = args;

    const values: Insertable<DB['exams']> = {
        title: body.title,
        description: body.description,
        subject_id: body.subjectId,
        duration_minutes: body.durationMinutes,
        passing_score: body.passingScore,
        scheduled_date: body.startDateTime ? new Date(body.startDateTime) : null,
        end_date_time: body.endDateTime ? new Date(body.endDateTime) : null,
        status: 'DRAFT',
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
        institution_id: institutionId ?? body.institutionId ?? null,
        question_count: body.questions?.length ?? 0,
    };

    if (sectionColumnSupport?.hasSectionId) {
        values.section_id = body.sectionId ?? null;
    }

    if (sectionColumnSupport?.hasSectionName) {
        values.section_name = body.section;
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
}): Updateable<DB['exams']> {
    const { body, institutionId, userId, sectionColumnSupport } = args;

    const values: Updateable<DB['exams']> = {
        title: body.title,
        description: body.description,
        subject_id: body.subjectId,
        duration_minutes: body.durationMinutes,
        passing_score: body.passingScore,
        scheduled_date: body.startDateTime ? new Date(body.startDateTime) : undefined,
        end_date_time: body.endDateTime ? new Date(body.endDateTime) : undefined,
        updated_by: userId,
        updated_at: new Date(),
        institution_id: institutionId ?? body.institutionId,
        question_count: body.questions?.length,
    };

    if (sectionColumnSupport?.hasSectionId) {
        values.section_id = body.sectionId;
    }

    if (sectionColumnSupport?.hasSectionName) {
        values.section_name = body.section;
    }

    if (sectionColumnSupport?.hasRoomId && body.roomId !== undefined) {
        values.room_id = body.roomId ?? null;
    }

    return values;
}
