import { QuestionTableItem } from "@/app/(protected)/(instructor)/question/bank/_components/columns";
import { formatDistanceToNow } from "date-fns";

/**
 * Extended type for question bank items that might include additional metadata
 */
export interface ExtendedQuestion extends QuestionTableItem {
    difficulty?: string;
}

/**
 * Custom hook to manage all display logic and data transformations for the question preview.
 */
export function useQuestionPreview(question: QuestionTableItem | null) {
    if (!question) {
        return {
            timeAgo: "recently",
            difficulty: "Medium",
            formattedPoints: "0 pts",
            typeLabel: "Unknown",
            prompt: "",
            id: "",
            tags: [],
        };
    }

    const extendedQuestion = question as ExtendedQuestion;
    
    // Time ago calculation
    const createdAtStr = extendedQuestion.createdAt;
    const createdAt = createdAtStr ? new Date(createdAtStr) : null;
    const timeAgo = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : "recently";

    // Difficulty mapping
    const difficulty = extendedQuestion.difficulty || "Medium";

    // Metadata formatting
    const formattedPoints = `${question.points} pts`;
    const typeLabel = question.type.toLowerCase().replace("_", " ");
    const prompt = question.prompt ?? question.content.prompt;
    const id = question.id;
    const tags = question.tags || [];

    return {
        timeAgo,
        difficulty,
        formattedPoints,
        typeLabel,
        prompt,
        id,
        tags,
    };
}
