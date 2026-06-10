import type { ExtractedPdfDocument } from '../pdf-page-extractor';
import type { RawGeneratedQuestion } from '../types';

/**
 * Normalizes filenames to standardized lowercase alphanumeric strings for accurate fuzzy matching.
 */
export function normalizeFileNameForMatch(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/\.pdf$/i, '')
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Generates initial empty extracted PDF documents, determining base page counts from metadata.
 */
export function createGeminiNativeSourceDocuments(
    files: File[],
    rawQuestions: RawGeneratedQuestion[],
    sourcePageCounts: Array<{ fileName: string; pageCount: number }>,
): ExtractedPdfDocument[] {
    return files.map((file) => {
        const normalizedFileName = normalizeFileNameForMatch(file.name);
        const sourcePageCount = sourcePageCounts.find(
            (source) => normalizeFileNameForMatch(source.fileName) === normalizedFileName,
        )?.pageCount;
        const citedPageNumbers = rawQuestions
            .filter(
                (question) =>
                    normalizeFileNameForMatch(question.sourceFileName) === normalizedFileName,
            )
            .map((question) => question.sourcePageNumber);

        return {
            fileName: file.name,
            pageCount: Math.max(1, sourcePageCount ?? 1, ...citedPageNumbers),
            pages: [],
        };
    });
}

/**
 * Step 4: Constructs initial native source documents representing metadata of files.
 */
export function buildSourceDocumentsStep(
    files: File[],
    rawQuestions: RawGeneratedQuestion[],
    sourcePageCounts: Array<{ fileName: string; pageCount: number }>,
): ExtractedPdfDocument[] {
    return createGeminiNativeSourceDocuments(files, rawQuestions, sourcePageCounts);
}
