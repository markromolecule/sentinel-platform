export type LlmInlineData = {
    mimeType: string;
    data: string;
};

export type LlmFile = {
    name: string;
    uri: string;
    mimeType: string;
    sizeBytes?: string;
    displayName?: string;
    inlineData?: LlmInlineData;
};

export interface QuestionGeneratorLlmProvider {
    resolveFlashModel(model?: string): string;
    uploadFile(args: { buffer: Buffer; mimeType: string; displayName: string }): Promise<LlmFile>;
    generateStructuredJson<T>(args: {
        prompt: string;
        responseJsonSchema: unknown;
        files?: Array<{ uri: string; mimeType: string; inlineData?: LlmInlineData }>;
        model?: string;
    }): Promise<T>;
    deleteFile(name: string): Promise<void>;
    getBackendInfo?(): { backend: string; project?: string; location?: string };
}

export type RawGeneratedQuestion = {
    subjectId?: string;
    sourceFileName: string;
    sourcePageNumber: number;
    sourceEvidence: string;
    passageContent: string;
    difficulty?: string;
    points?: number;
    tags?: string[];
    content: unknown;
    type: string;
    // TOS metadata
    topic?: string;
    cognitive_level?: string;
    predicted_difficulty?: string;
};

export interface GenerateBatchesResult {
    rawQuestions: RawGeneratedQuestion[];
    deficits: Array<{ type: string; count: number }>;
}
