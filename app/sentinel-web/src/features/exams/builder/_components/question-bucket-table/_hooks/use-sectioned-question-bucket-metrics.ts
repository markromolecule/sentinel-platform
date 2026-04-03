"use client";

import * as React from "react";
import type { ExamQuestion, ExamQuestionSection } from "@sentinel/shared/types";
import {
    getTotalPoints,
    groupQuestionsBySection,
} from "../shared";

type SectionViewModel = {
    section: ExamQuestionSection;
    sectionIndex: number;
    questions: ExamQuestion[];
    totalPoints: number;
    questionNumberOffset: number;
};

export function useSectionedQuestionBucketMetrics(
    sections: ExamQuestionSection[],
    questions: ExamQuestion[],
) {
    const totalPoints = React.useMemo(() => getTotalPoints(questions), [questions]);

    const sectionViewModels = React.useMemo<SectionViewModel[]>(() => {
        const questionsBySection = groupQuestionsBySection(sections, questions);

        return sections.reduce<SectionViewModel[]>((viewModels, section, sectionIndex) => {
            const previousSection = viewModels[viewModels.length - 1];
            const sectionQuestions = questionsBySection.get(section.id) ?? [];
            const questionNumberOffset = previousSection
                ? previousSection.questionNumberOffset + previousSection.questions.length
                : 0;

            return [
                ...viewModels,
                {
                    section,
                    sectionIndex,
                    questions: sectionQuestions,
                    totalPoints: getTotalPoints(sectionQuestions),
                    questionNumberOffset,
                },
            ];
        }, []);
    }, [questions, sections]);

    return {
        totalPoints,
        sectionViewModels,
    };
}
