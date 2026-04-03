import * as XLSX from "xlsx";
import type {
    ExamQuestionContent,
    MatchingPair,
    QuestionType,
} from "@sentinel/shared/types";
import type {
    ImportPreviewDifficulty,
    ImportPreviewQuestion,
    QuestionImportDraft,
    QuestionImportDraftWarning,
} from "./types";

type SheetRow = Record<string, unknown>;

const TYPE_ALIASES: Record<string, QuestionType> = {
    multiplechoice: "MULTIPLE_CHOICE",
    mcq: "MULTIPLE_CHOICE",
    multipleresponse: "MULTIPLE_RESPONSE",
    multiselect: "MULTIPLE_RESPONSE",
    truefalse: "TRUE_FALSE",
    boolean: "TRUE_FALSE",
    identification: "IDENTIFICATION",
    shortanswer: "IDENTIFICATION",
    essay: "ESSAY",
    longanswer: "ESSAY",
    fillblank: "FILL_BLANK",
    fillintheblank: "FILL_BLANK",
    enumeration: "ENUMERATION",
    matching: "MATCHING",
};

function normalizeHeader(value: string) {
    return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeType(value: string): QuestionType | null {
    const normalized = normalizeHeader(value);
    return TYPE_ALIASES[normalized] ?? null;
}

function getCellValue(row: SheetRow, candidateHeaders: string[]) {
    const entries = Object.entries(row);

    for (const candidateHeader of candidateHeaders) {
        const normalizedCandidate = normalizeHeader(candidateHeader);
        const match = entries.find(([key]) => normalizeHeader(key) === normalizedCandidate);

        if (!match) {
            continue;
        }

        return match[1];
    }

    return undefined;
}

function stringifyCell(value: unknown) {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "string") {
        return value.trim();
    }

    return String(value).trim();
}

function splitDelimitedValues(value: string, allowComma = false) {
    const delimiter = allowComma ? /[\n\r|;,]+/ : /[\n\r|;]+/;

    return value
        .split(delimiter)
        .map((item) => item.trim())
        .filter(Boolean);
}

function parseDifficulty(value: string): ImportPreviewDifficulty {
    const normalized = value.trim().toLowerCase();

    if (normalized === "easy") {
        return "Easy";
    }

    if (normalized === "hard") {
        return "Hard";
    }

    return "Medium";
}

function parsePoints(value: unknown) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue < 1) {
        return 1;
    }

    return Math.min(100, Math.round(numericValue));
}

function parseBoolean(value: string) {
    const normalized = value.trim().toLowerCase();

    if (["true", "t", "yes", "y", "1"].includes(normalized)) {
        return true;
    }

    if (["false", "f", "no", "n", "0"].includes(normalized)) {
        return false;
    }

    return null;
}

function parseMatchingPairs(value: string): MatchingPair[] {
    if (!value) {
        return [];
    }

    try {
        const parsedValue = JSON.parse(value);

        if (Array.isArray(parsedValue)) {
            return parsedValue
                .map((item) => {
                    if (
                        item &&
                        typeof item === "object" &&
                        "left" in item &&
                        "right" in item
                    ) {
                        return {
                            left: stringifyCell((item as { left: unknown }).left),
                            right: stringifyCell((item as { right: unknown }).right),
                        };
                    }

                    return null;
                })
                .filter((item): item is MatchingPair => Boolean(item?.left && item.right));
        }
    } catch {
        // Fall back to delimiter parsing below.
    }

    return splitDelimitedValues(value)
        .map((item) => {
            const pairSeparator = item.includes("=>") ? "=>" : ":";
            const [left, right] = item.split(pairSeparator).map((part) => part.trim());

            if (!left || !right) {
                return null;
            }

            return { left, right };
        })
        .filter((item): item is MatchingPair => Boolean(item));
}

function buildQuestionContent(args: {
    prompt: string;
    type: QuestionType;
    row: SheetRow;
}): ExamQuestionContent {
    const { prompt, type, row } = args;
    const options = splitDelimitedValues(
        stringifyCell(getCellValue(row, ["options", "choices", "answers"])),
    );
    const correctAnswer = stringifyCell(
        getCellValue(row, ["correctAnswer", "answer", "correct", "expectedAnswer"]),
    );
    const acceptedAnswers = splitDelimitedValues(
        stringifyCell(getCellValue(row, ["acceptedAnswers", "accepted", "alternatives"])),
        true,
    );
    const rubric = stringifyCell(getCellValue(row, ["rubric", "criteria", "notes"]));
    const maxLengthValue = stringifyCell(getCellValue(row, ["maxLength", "maxlength"]));
    const pairs = parseMatchingPairs(
        stringifyCell(getCellValue(row, ["pairs", "matchingPairs", "matches"])),
    );

    switch (type) {
        case "MULTIPLE_CHOICE":
            if (options.length < 2) {
                throw new Error("requires at least two options");
            }

            if (!correctAnswer) {
                throw new Error("requires a correct answer");
            }

            return {
                prompt,
                options,
                correctAnswer,
            };

        case "MULTIPLE_RESPONSE": {
            const correctAnswers = splitDelimitedValues(correctAnswer, true);

            if (options.length < 2) {
                throw new Error("requires at least two options");
            }

            if (correctAnswers.length === 0) {
                throw new Error("requires at least one correct answer");
            }

            return {
                prompt,
                options,
                correctAnswer: correctAnswers,
            };
        }

        case "TRUE_FALSE": {
            const parsedBoolean = parseBoolean(correctAnswer);

            if (parsedBoolean === null) {
                throw new Error("requires a true/false answer");
            }

            return {
                prompt,
                correctAnswer: parsedBoolean,
                correctBoolean: parsedBoolean,
            };
        }

        case "IDENTIFICATION":
        case "FILL_BLANK":
        case "ENUMERATION": {
            const answers = acceptedAnswers.length
                ? acceptedAnswers
                : splitDelimitedValues(correctAnswer, true);

            if (answers.length === 0) {
                throw new Error("requires at least one accepted answer");
            }

            return {
                prompt,
                acceptedAnswers: answers,
                correctAnswer: answers[0],
            };
        }

        case "ESSAY":
            return {
                prompt,
                rubric: rubric || undefined,
                maxLength: maxLengthValue ? Number(maxLengthValue) || undefined : undefined,
            };

        case "MATCHING":
            if (pairs.length === 0) {
                throw new Error("requires at least one matching pair");
            }

            return {
                prompt,
                pairs,
            };
    }
}

function parseQuestionRow(row: SheetRow): ImportPreviewQuestion | null {
    const prompt = stringifyCell(
        getCellValue(row, ["prompt", "question", "questionText", "text"]),
    );
    const rawType = stringifyCell(getCellValue(row, ["type", "questionType"]));

    if (!prompt && !rawType && Object.values(row).every((value) => !stringifyCell(value))) {
        return null;
    }

    if (!prompt) {
        throw new Error("missing prompt");
    }

    const type = normalizeType(rawType);

    if (!type) {
        throw new Error("missing or unsupported question type");
    }

    return {
        id: crypto.randomUUID(),
        prompt,
        type,
        difficulty: parseDifficulty(
            stringifyCell(getCellValue(row, ["difficulty", "level"])),
        ),
        points: parsePoints(getCellValue(row, ["points", "score", "marks"])),
        tags: splitDelimitedValues(
            stringifyCell(getCellValue(row, ["tags", "tag"])),
            true,
        ),
        content: buildQuestionContent({
            prompt,
            type,
            row,
        }),
    };
}

function buildBatchLabel(fileName: string) {
    const trimmedFileName = fileName.replace(/\.[^.]+$/, "").trim();
    const dateLabel = new Date().toLocaleDateString();

    if (!trimmedFileName) {
        return `Imported Batch - ${dateLabel}`;
    }

    return `${trimmedFileName} - ${dateLabel}`;
}

export async function parseQuestionImportFile(file: File): Promise<QuestionImportDraft> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
        throw new Error("The uploaded file does not contain any sheets.");
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<SheetRow>(worksheet, {
        defval: "",
    });

    if (rows.length === 0) {
        throw new Error("The uploaded file is empty.");
    }

    const questions: ImportPreviewQuestion[] = [];
    const warnings: QuestionImportDraftWarning[] = [];

    rows.forEach((row, index) => {
        try {
            const question = parseQuestionRow(row);

            if (question) {
                questions.push(question);
            }
        } catch (error) {
            warnings.push({
                rowNumber: index + 2,
                reason: error instanceof Error ? error.message : "Unable to parse row",
            });
        }
    });

    if (questions.length === 0) {
        throw new Error("No valid questions were found in the uploaded file.");
    }

    return {
        id: crypto.randomUUID(),
        batchLabel: buildBatchLabel(file.name),
        sourceMode: "upload",
        sourceLabel: file.name,
        createdAt: new Date().toISOString(),
        questions,
        warnings,
    };
}
