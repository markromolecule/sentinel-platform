import { type Insertable, type Updateable } from 'kysely';
import type { DB } from '@sentinel/db';
import type { CreateExamBody, UpdateExamBody } from '../exam.dto';

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
}): Insertable<DB['exams']> {
    const { body, institutionId, userId } = args;

    return {
        title: body.title,
        description: body.description,
        subject_id: body.subjectId,
        section_id: body.sectionId ?? null,
        section_name: body.section,
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
}

export function buildUpdateExamValues(args: {
    body: UpdateExamBody;
    institutionId?: string;
    userId: string;
}): Updateable<DB['exams']> {
    const { body, institutionId, userId } = args;

    return {
        title: body.title,
        description: body.description,
        subject_id: body.subjectId,
        section_id: body.sectionId,
        section_name: body.section,
        duration_minutes: body.durationMinutes,
        passing_score: body.passingScore,
        scheduled_date: body.startDateTime ? new Date(body.startDateTime) : undefined,
        end_date_time: body.endDateTime ? new Date(body.endDateTime) : undefined,
        updated_by: userId,
        updated_at: new Date(),
        institution_id: institutionId ?? body.institutionId,
        question_count: body.questions?.length,
    };
}
