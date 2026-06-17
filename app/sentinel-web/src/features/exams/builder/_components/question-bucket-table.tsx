'use client';

import type { QuestionBucketTableProps } from './_types';
import { FlatQuestionBucketTable } from './question-bucket-table/flat-question-bucket-table';
import { SectionedQuestionBucketTable } from './question-bucket-table/sectioned-question-bucket-table';

/**
 * QuestionBucketTable chooses the flat or sectioned question layout and applies the shared
 * workspace container treatment for the sectioned builder experience.
 *
 * @param props - QuestionBucketTableProps describing the available exam questions.
 */
export function QuestionBucketTable(props: QuestionBucketTableProps) {
    if (!props.sections || props.sections.length === 0) {
        return <FlatQuestionBucketTable {...props} />;
    }

    return (
        <div className="border-border/60 bg-background/90 rounded-3xl border p-4 shadow-sm md:p-5">
            <SectionedQuestionBucketTable {...props} sections={props.sections} />
        </div>
    );
}
