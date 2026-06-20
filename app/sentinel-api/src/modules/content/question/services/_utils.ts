/**
 * Builds the source-related column values for a question record.
 * When `sourceOrigin` is `AI_PDF`, the file/page/evidence fields are
 * preserved; otherwise they are cleared to `null`.
 *
 * @param args - Raw source fields from the request body or existing record
 * @returns Kysely-compatible column values for insert/update
 */
export function buildQuestionSourceValues(args: {
    sourceOrigin?: string | null;
    sourceFileName?: string | null;
    sourcePageNumber?: number | null;
    sourceEvidence?: string | null;
    passageContent?: string | null;
    passageType?: string | null;
}) {
    const sourceOrigin = args.sourceOrigin === 'AI_PDF' ? 'AI_PDF' : 'MANUAL';

    if (sourceOrigin === 'AI_PDF') {
        return {
            source_origin: sourceOrigin,
            source_file_name: args.sourceFileName ?? null,
            source_page_number: args.sourcePageNumber ?? null,
            source_evidence: args.sourceEvidence ?? null,
            passage_content: args.passageContent ?? null,
            passage_type: args.passageType === 'html' ? 'html' : 'plain',
        };
    }

    return {
        source_origin: 'MANUAL' as const,
        source_file_name: null,
        source_page_number: null,
        source_evidence: null,
        passage_content: args.passageContent ?? null,
        passage_type: args.passageType === 'html' ? 'html' : 'plain',
    };
}
