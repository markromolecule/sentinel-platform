import { HTTPException } from 'hono/http-exception';
import type { CreateExamBody, UpdateExamBody } from '../exam.dto';

type ExamSectionInput =
    | NonNullable<CreateExamBody['questionSections']>[number]
    | NonNullable<UpdateExamBody['questionSections']>[number];

type ExamQuestionInput =
    | NonNullable<CreateExamBody['questions']>[number]
    | NonNullable<UpdateExamBody['questions']>[number];

function assertNoDuplicates<T>(args: {
    items: T[];
    label: string;
    getValue: (item: T) => string | number | undefined;
}) {
    const seen = new Set<string | number>();

    for (const item of args.items) {
        const value = args.getValue(item);

        if (value === undefined) {
            continue;
        }

        if (seen.has(value)) {
            throw new HTTPException(400, {
                message: `Duplicate ${args.label} values are not allowed.`,
            });
        }

        seen.add(value);
    }
}

export function assertExamStructureInput(args: {
    questionSections?: CreateExamBody['questionSections'] | UpdateExamBody['questionSections'];
    questions?: CreateExamBody['questions'] | UpdateExamBody['questions'];
}) {
    const questionSections = (args.questionSections ?? []) as ExamSectionInput[];
    const questions = (args.questions ?? []) as ExamQuestionInput[];

    assertNoDuplicates({
        items: questionSections,
        label: 'section id',
        getValue: (section) => section.id,
    });

    assertNoDuplicates({
        items: questionSections,
        label: 'section orderIndex',
        getValue: (section) => section.orderIndex,
    });

    assertNoDuplicates({
        items: questions,
        label: 'question id',
        getValue: (question) => question.id,
    });

    assertNoDuplicates({
        items: questions,
        label: 'question orderIndex',
        getValue: (question) => question.orderIndex,
    });
}
