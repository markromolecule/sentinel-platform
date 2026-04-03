import { type DbClient } from '@sentinel/db';
import { ExamService } from '../exams/exam.service';
import { QuestionTypeService } from '../question-type/question-type.service';
import type { BuilderWorkspace, SaveBuilderWorkspaceBody } from './builder.dto';

function buildBuilderWorkspace(exam: BuilderWorkspace['exam']): BuilderWorkspace {
    return {
        exam,
        questionTypes: QuestionTypeService.getQuestionTypes(),
    };
}

export class BuilderService {
    static async getBuilderWorkspace(
        dbClient: DbClient,
        examId: string,
        institutionId?: string,
    ) {
        const exam = await ExamService.getExamById(dbClient, examId, institutionId);

        return buildBuilderWorkspace(exam);
    }

    static async saveBuilderWorkspace(
        dbClient: DbClient,
        examId: string,
        body: SaveBuilderWorkspaceBody,
        institutionId: string | undefined,
        userId: string,
    ) {
        const exam = await ExamService.updateExam(dbClient, examId, body, institutionId, userId);

        return buildBuilderWorkspace(exam);
    }

    static async publishBuilderWorkspace(
        dbClient: DbClient,
        examId: string,
        institutionId: string | undefined,
        userId: string,
    ) {
        const exam = await ExamService.updateExamStatus(
            dbClient,
            examId,
            'published',
            institutionId,
            userId,
        );

        return buildBuilderWorkspace(exam);
    }
}
