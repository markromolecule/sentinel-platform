"use client";

import type { QuestionBucketTableProps } from "./_types";
import { FlatQuestionBucketTable } from "./question-bucket-table/flat-question-bucket-table";
import { SectionedQuestionBucketTable } from "./question-bucket-table/sectioned-question-bucket-table";

export function QuestionBucketTable(props: QuestionBucketTableProps) {
    if (!props.sections || props.sections.length === 0) {
        return <FlatQuestionBucketTable {...props} />;
    }

    return <SectionedQuestionBucketTable {...props} sections={props.sections} />;
}
