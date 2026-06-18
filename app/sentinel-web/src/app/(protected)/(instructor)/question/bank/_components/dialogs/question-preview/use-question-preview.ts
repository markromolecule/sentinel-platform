import { QuestionTableItem } from '@/app/(protected)/(instructor)/question/bank/_components/tables/columns';
import { formatDistanceToNow } from 'date-fns';

const QUESTION_DIFFICULTY_LABELS: Record<QuestionTableItem['difficulty'], string> = {
    EASY: 'Easy',
    MODERATE: 'Moderate',
    HARD: 'Hard',
};

/**
 * Custom hook to manage all display logic and data transformations for the question preview.
 */
export function useQuestionPreview(question: QuestionTableItem | null) {
    if (!question) {
        return {
            timeAgo: 'recently',
            difficulty: 'Moderate',
            formattedPoints: '0 pts',
            typeLabel: 'Unknown',
            prompt: '',
            id: '',
            tags: [],
            sourceLabel: 'Manual entry',
            sourceEvidence: null,
            passageContent: null,
            passageType: null,
        };
    }

    // Time ago calculation
    const createdAtStr = question.createdAt;
    const createdAt = createdAtStr ? new Date(createdAtStr) : null;
    const timeAgo = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : 'recently';

    // Difficulty mapping
    const difficulty = QUESTION_DIFFICULTY_LABELS[question.difficulty];

    // Metadata formatting
    const formattedPoints = `${question.points} pts`;
    const typeLabel = question.type.toLowerCase().replace('_', ' ');
    const prompt = question.prompt ?? question.content.prompt;
    const id = question.id;
    const tags = question.tags || [];
    const sourceLabel =
        question.sourceOrigin === 'AI_PDF'
            ? `${question.sourceFileName} • Page ${question.sourcePageNumber}`
            : 'Manual entry';
    const sourceEvidence = question.sourceEvidence ?? null;
    const passageContent = question.passageContent ?? null;
    const passageType = question.passageType ?? null;

    return {
        timeAgo,
        difficulty,
        formattedPoints,
        typeLabel,
        prompt,
        id,
        tags,
        sourceLabel,
        sourceEvidence,
        passageContent,
        passageType,
    };
}
