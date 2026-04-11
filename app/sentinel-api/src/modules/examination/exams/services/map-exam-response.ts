import type { ExamDetail, ExamSummary } from '../exam.dto';
import { resolveExamStatus } from './resolve-exam-status';

export type RawExamRecord = {
    exam_id: string;
    title: string;
    description: string | null;
    duration_minutes: number;
    passing_score: number | null;
    status: string | null;
    subject_id: string | null;
    subject_title?: string | null;
    section_id?: string | null;
    section_name: string | null;
    linked_section_name?: string | null;
    room_id?: string | null;
    room_name?: string | null;
    scheduled_date: Date | string | null;
    end_date_time: Date | string | null;
    published_at: Date | string | null;
    question_count: number | null;
    created_at: Date | string | null;
    updated_at: Date | string | null;
    institution_id?: string | null;
};

export function mapExamSummaryResponse(record: RawExamRecord): ExamSummary {
    return {
        id: record.exam_id,
        title: record.title,
        description: record.description,
        durationMinutes: record.duration_minutes,
        passingScore: record.passing_score ?? 0,
        status: resolveExamStatus({
            status: record.status,
            scheduledDate: record.scheduled_date,
            endDateTime: record.end_date_time,
            durationMinutes: record.duration_minutes,
        }),
        subjectId: record.subject_id,
        subjectTitle: record.subject_title ?? null,
        sectionId: record.section_id ?? null,
        sectionName: record.section_name ?? record.linked_section_name ?? null,
        roomId: record.room_id ?? null,
        roomName: record.room_name ?? null,
        scheduledDate: record.scheduled_date ?? null,
        endDateTime: record.end_date_time ?? null,
        publishedAt: record.published_at ?? null,
        questionCount: record.question_count ?? 0,
        createdAt: record.created_at ?? null,
        updatedAt: record.updated_at ?? null,
    };
}

export function mapExamDetailResponse(args: {
    exam: RawExamRecord;
    settings: ExamDetail['settings'];
    configuration: ExamDetail['configuration'];
    questionSections: ExamDetail['questionSections'];
    questions: ExamDetail['questions'];
}): ExamDetail {
    return {
        ...mapExamSummaryResponse(args.exam),
        settings: args.settings,
        configuration: args.configuration,
        questionSections: args.questionSections,
        questions: args.questions,
    };
}
