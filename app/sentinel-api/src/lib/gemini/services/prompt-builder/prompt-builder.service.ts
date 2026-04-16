import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';
import {
    QUESTION_DIFFICULTIES,
    QUESTION_TYPE_DEFINITIONS,
    QUESTION_TYPE_LABELS,
} from './definitions';
import type { ExtractedPdfDocument } from '../question-generator/pdf-page-extractor';
import { getAllowedQuestionTypes, getQuestionTypeDistribution } from './helpers';

function renderSourceDocuments(documents: ExtractedPdfDocument[]) {
    return documents
        .map((document) => {
            const pageBlocks = document.pages
                .map(
                    (page) =>
                        `FILE: ${document.fileName}\nPAGE: ${page.pageNumber}\nTEXT: ${page.text || '[No extractable text detected on this page.]'}`,
                )
                .join('\n\n');

            return `SOURCE DOCUMENT: ${document.fileName} (${document.pageCount} pages)\n${pageBlocks}`;
        })
        .join('\n\n');
}

/**
 * Builds the Gemini API prompt string from the generation config and source file name.
 */
export function buildPrompt(args: {
    config: GenerateQuestionPreviewConfig;
    sourceDocuments: ExtractedPdfDocument[];
}) {
    const { config, sourceDocuments } = args;
    const distribution = getQuestionTypeDistribution(config);
    const requestedQuestionTypes = getAllowedQuestionTypes(config);

    const allowedDifficulties = config.difficulty
        ? [config.difficulty]
        : [...QUESTION_DIFFICULTIES];

    const distributionSummary = distribution
        .map(
            (item) =>
                `${item.count} ${QUESTION_TYPE_LABELS[item.type]} question${item.count === 1 ? '' : 's'}`,
        )
        .join(', ');

    const sourceFileDescription =
        sourceDocuments.length === 1
            ? sourceDocuments[0].fileName
            : `${sourceDocuments.length} files: ${sourceDocuments.map((document) => document.fileName).join(', ')}`;

    return [
        'Generate assessment questions from the extracted source pages below.',
        `Generate exactly ${config.questionCount} questions with this distribution: ${distributionSummary}.`,
        'Group the generated questions into their corresponding array fields based on the question type.',
        config.difficulty
            ? `Set the "difficulty" field of every question to the exact enum value "${config.difficulty}".`
            : `Set the "difficulty" field of every question to one of: ${allowedDifficulties.join(', ')}.`,
        config.points
            ? `Set the points value of every question to ${config.points}.`
            : 'Use reasonable point values, defaulting to 1 unless a higher value is justified.',
        config.language
            ? `Write the questions in ${config.language}.`
            : 'Write in the same language and tone used in the lesson.',
        'Inside every question content object, always include a non-empty "prompt" string. Do not use only "stem", "question", or "statement" without also providing "prompt".',
        ...requestedQuestionTypes.map((type) => QUESTION_TYPE_DEFINITIONS[type].instructions),
        'Base every question strictly on the source page text. Do not invent facts that are not supported by the document.',
        'Avoid duplicate or near-duplicate questions.',
        'Each question should be classroom-ready and phrased clearly for students.',
        'Add one to three concise topical tags per question when helpful.',
        'Every generated question must include "sourceFileName", "sourcePageNumber", and "sourceEvidence".',
        'Set "sourceFileName" to the exact file name of the supporting source document.',
        'Set "sourcePageNumber" to the exact 1-based PDF page number where the answer support appears.',
        'Set "sourceEvidence" to a short verbatim excerpt copied from that exact page text.',
        'Do not use a source page number that does not exist in the provided source documents.',
        config.additionalInstructions
            ? `Additional instructor instructions: ${config.additionalInstructions}`
            : null,
        `The source file name is ${sourceFileDescription}.`,
        'Use the source documents below as the authoritative page map:',
        renderSourceDocuments(sourceDocuments),
        'Return only JSON that matches the supplied schema.',
    ]
        .filter(Boolean)
        .join('\n');
}

/**
 * Builds the JSON schema object that constrains the Gemini API response shape
 * for a given generation config.
 */
export function buildResponseJsonSchema(config: GenerateQuestionPreviewConfig) {
    const allowedDifficulties = config.difficulty
        ? [config.difficulty]
        : [...QUESTION_DIFFICULTIES];
    const allowedQuestionTypes = getAllowedQuestionTypes(config);

    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const type of allowedQuestionTypes) {
        properties[type] = {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    sourceFileName: {
                        type: 'string',
                    },
                    sourcePageNumber: {
                        type: 'integer',
                        minimum: 1,
                    },
                    sourceEvidence: {
                        type: 'string',
                    },
                    difficulty: {
                        type: 'string',
                        enum: allowedDifficulties,
                    },
                    points: { type: 'integer' },
                    tags: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                    content: QUESTION_TYPE_DEFINITIONS[type].schema,
                },
                required: [
                    'sourceFileName',
                    'sourcePageNumber',
                    'sourceEvidence',
                    'difficulty',
                    'points',
                    'content',
                ],
            },
        };
        required.push(type);
    }

    return {
        type: 'object',
        properties,
        required,
    };
}
