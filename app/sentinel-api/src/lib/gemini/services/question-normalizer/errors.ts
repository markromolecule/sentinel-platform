/**
 * Base error class for all question normalization failures.
 * Used to decouple business logic from framework-specific (Hono) errors.
 */
export class QuestionNormalizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QuestionNormalizationError';
    }
}

/**
 * Thrown when the generated question type is invalid or disallowed.
 */
export class InvalidQuestionTypeError extends QuestionNormalizationError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidQuestionTypeError';
    }
}

/**
 * Thrown when the generated source metadata (file, page, evidence)
 * cannot be validated against the source documents.
 */
export class SourceMetadataValidationError extends QuestionNormalizationError {
    constructor(message: string) {
        super(message);
        this.name = 'SourceMetadataValidationError';
    }
}
