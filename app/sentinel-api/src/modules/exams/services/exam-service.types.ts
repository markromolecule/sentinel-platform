import type { CreateExamBody, UpdateExamBody } from '../exam.dto';

export type ExamStructureSectionInput =
    | NonNullable<CreateExamBody['questionSections']>[number]
    | NonNullable<UpdateExamBody['questionSections']>[number];

export type ExamStructureQuestionInput =
    | NonNullable<CreateExamBody['questions']>[number]
    | NonNullable<UpdateExamBody['questions']>[number];

export type NormalizeExamStructureInputArgs = {
    examId: string;
    questionSections?: CreateExamBody['questionSections'] | UpdateExamBody['questionSections'];
    questions?: CreateExamBody['questions'] | UpdateExamBody['questions'];
};
