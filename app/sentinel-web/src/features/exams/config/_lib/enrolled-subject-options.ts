import type { EnrolledSubjectData } from '@sentinel/shared/types';

export type ExamSectionOption = {
    id: string;
    name: string;
};

export type ExamSubjectOption = {
    id: string;
    code: string;
    title: string;
    sections: ExamSectionOption[];
};

export function mapEnrolledSubjectsToExamOptions(
    enrolledSubjects: EnrolledSubjectData[],
): ExamSubjectOption[] {
    const subjectMap = new Map<string, ExamSubjectOption>();

    enrolledSubjects.forEach((subject) => {
        const current = subjectMap.get(subject.subject_id) ?? {
            id: subject.subject_id,
            code: subject.code,
            title: subject.title,
            sections: [],
        };

        const sectionMap = new Map(current.sections.map((section) => [section.id, section]));

        subject.sections.forEach((section) => {
            if (!section.section_id || !section.name) {
                return;
            }

            sectionMap.set(section.section_id, {
                id: section.section_id,
                name: section.name,
            });
        });

        current.sections = Array.from(sectionMap.values()).sort((left, right) =>
            left.name.localeCompare(right.name),
        );
        subjectMap.set(subject.subject_id, current);
    });

    return Array.from(subjectMap.values()).sort((left, right) =>
        left.title.localeCompare(right.title),
    );
}
