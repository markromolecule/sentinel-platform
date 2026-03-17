import {
    AlignLeft,
    CheckCircle2,
    CircleDot,
    ClipboardList,
    ListChecks,
    Shuffle,
} from "lucide-react";
import type { QuestionType } from "./types";

export const QUESTION_TYPE_META: Record<
    QuestionType,
    { label: string; description: string; icon: typeof ListChecks }
> = {
    multiple_choice: {
        label: "Multiple Choice",
        description: "Select one correct option.",
        icon: ListChecks,
    },
    identification: {
        label: "Identification",
        description: "Short answer response.",
        icon: ClipboardList,
    },
    essay: {
        label: "Essay",
        description: "Long form with rubric.",
        icon: AlignLeft,
    },
    true_false: {
        label: "True / False",
        description: "Binary choice question.",
        icon: CheckCircle2,
    },
    matching: {
        label: "Matching",
        description: "Pair terms and definitions.",
        icon: Shuffle,
    },
    fill_blank: {
        label: "Fill in the Blank",
        description: "Complete the missing word.",
        icon: CircleDot,
    },
};
