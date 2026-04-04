import type { GenerateQuestionPreviewConfig } from '@sentinel/shared';
import {
    QUESTION_DIFFICULTIES,
    QUESTION_TYPE_DEFINITIONS,
    QUESTION_TYPE_LABELS,
} from './definitions';
import {
    getAllowedQuestionTypes,
    getQuestionTypeDistribution,
    buildLooseMixedContentJsonSchema,
} from './helpers';

/**
 * Builds the Gemini API prompt string from the generation config and source file name.
 */
export function buildPrompt(args: { config: GenerateQuestionPreviewConfig; fileNames: string[] }) {
    const { config, fileNames } = args;
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
        fileNames.length === 1 ? fileNames[0] : `${fileNames.length} files: ${fileNames.join(', ')}`;

    return [
        'Generate assessment questions from the attached PDF lesson file or files.',
        `Generate exactly ${config.questionCount} questions with this distribution: ${distributionSummary}.`,
        requestedQuestionTypes.length === 1
            ? `Set the "type" field of every question to the exact enum value "${requestedQuestionTypes[0]}".`
            : `Set the "type" field of every question to one of these exact enum values: ${requestedQuestionTypes.join(', ')}.`,
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
        'Base every question strictly on the PDF content. Do not invent facts that are not supported by the document.',
        'Avoid duplicate or near-duplicate questions.',
        'Each question should be classroom-ready and phrased clearly for students.',
        'Add one to three concise topical tags per question when helpful.',
        config.additionalInstructions
            ? `Additional instructor instructions: ${config.additionalInstructions}`
            : null,
        `The source file name is ${sourceFileDescription}.`,
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
    const isSingleQuestionType = allowedQuestionTypes.length === 1;

    return {
        type: 'object',
        properties: {
            questions: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'string',
                            enum: allowedQuestionTypes,
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
                        content: isSingleQuestionType
                            ? QUESTION_TYPE_DEFINITIONS[allowedQuestionTypes[0]].schema
                            : buildLooseMixedContentJsonSchema(),
                    },
                    required: ['type', 'difficulty', 'points', 'content'],
                },
            },
        },
        required: ['questions'],
    };
}
